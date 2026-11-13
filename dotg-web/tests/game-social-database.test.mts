import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import type { SocialDashboard } from "../src/features/game-social/types.ts";
type Bundle = { ticket: string; host_key?: string; expires_at: number };

const a = "10000000-0000-4000-8000-000000000001";
const b = "10000000-0000-4000-8000-000000000002";
const c = "10000000-0000-4000-8000-000000000003";

test("Postgres enforces player identity, friendship consent, blocking and signed invitations", async (t) => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(`create schema extensions; create schema auth;
      create role anon; create role authenticated; create role service_role;
      create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner_id text,metadata jsonb,unique(bucket_id,name));
      alter table storage.objects enable row level security;
      grant usage on schema storage to authenticated;
      grant select,insert,update,delete on storage.objects to authenticated;
    `);
    for (const name of ["20260723073310_create_initial_content_schema.sql", "20260723073320_add_initial_rls_policies.sql", "20261113090000_add_game_social.sql", "20261113110000_add_game_room_directory.sql", "20261113120000_add_eos_p2p_rooms.sql", "20261114090000_add_player_account_settings.sql"]) {
      await db.exec(readFileSync(`supabase/migrations/${name}`, "utf8"));
    }
    await db.query("insert into auth.users(id) values($1),($2),($3)", [a,b,c]);
    async function asUser<T = SocialDashboard>(user: string, action: string, payload: Record<string, unknown> = {}): Promise<T> {
      await db.exec("begin; set local role authenticated");
      try {
        await db.query("select set_config('request.jwt.claim.sub',$1,true)", [user]);
        const result = await db.query<{ result: unknown }>("select public.game_social($1,$2::jsonb) as result", [action,JSON.stringify(payload)]);
        await db.exec("commit");
        return result.rows[0].result as T;
      } catch(error) { await db.exec("rollback"); throw error; }
    }
    async function deniedSql(role: string, sql: string) {
      await db.exec(`begin; set local role ${role}`);
      try { await assert.rejects(db.exec(sql)); } finally { await db.exec("rollback"); }
    }
    await t.test("anonymous calls and direct table access are denied", async () => {
      await deniedSql("anon", "select public.game_social('dashboard')");
      await deniedSql("authenticated", "select * from game_private.session_keys");
      for (const table of ["game_profiles","game_friendships","game_blocks","game_sessions","game_invites"]) {
        await deniedSql("authenticated", `select * from public.${table}`);
      }
      await assert.rejects(asUser("", "dashboard"));
    });
    await t.test("profiles cannot promote website roles or reuse another player's handle", async () => {
      for (const [id, handle] of [[a,"alice"],[b,"bob"],[c,"charlie"]]) {
        await asUser(id, "save_profile", { handle, display_name: `친구 ${handle}`, bio: "", avatar: "mint", role: "admin" });
      }
      assert.deepEqual((await db.query("select distinct role from public.profiles")).rows, [{role:"member"}]);
      await assert.rejects(asUser(b,"save_profile", {handle:"alice",display_name:"뺏기"}));
    });
    await t.test("signup creates separate private name and public nickname without elevating roles", async () => {
      const id = "10000000-0000-4000-8000-000000000004";
      const metadata = { handle: "New_Player", real_name: "김실명", display_name: "새로운친구", role: "admin" };
      await db.query("insert into auth.users(id,raw_user_meta_data) values($1,$2)", [id,JSON.stringify(metadata)]);
      const own = (await asUser(id,"dashboard")).profile!;
      assert.equal(own.real_name,"김실명"); assert.equal(own.display_name,"새로운친구"); assert.equal(own.handle,"new_player");
      assert.equal((await db.query<{role:string}>("select role from public.profiles where id=$1",[id])).rows[0].role,"member");
      await assert.rejects(db.query("insert into auth.users(id,raw_user_meta_data) values($1,$2)", ["10000000-0000-4000-8000-000000000005",JSON.stringify(metadata)]));
      const result = await asUser<Array<Record<string,unknown>>>(a,"search_players",{query:"새로운"});
      assert.equal(result.length,1); assert.equal(result[0].display_name,"새로운친구");
      assert.equal(result[0].real_name,undefined); assert.equal(result[0].email,undefined);
      assert.deepEqual(await asUser(a,"search_players",{query:"김실명"}),[]);
      assert.deepEqual(await asUser(a,"search_players",{query:"%_"}),[]);
      assert.deepEqual(await asUser(id,"search_players",{query:"new_player"}),[]);
      await asUser(id,"save_profile",{handle:"new_player",real_name:"김변경",display_name:"새로운친구"});
      assert.equal((await asUser(id,"dashboard")).profile!.real_name,"김변경");
      // Legacy clients may omit real_name, but must not erase it.
      await asUser(id,"save_profile",{handle:"new_player",display_name:"수정된닉네임"});
      assert.equal((await asUser(id,"dashboard")).profile!.real_name,"김변경");
      await assert.rejects(asUser(id,"save_profile",{handle:"new_player",real_name:"",display_name:"친구"}));
    });
    await t.test("avatar assignment and Storage policies enforce ownership and retain the active photo", async () => {
      const first = `${a}/20000000-0000-4000-8000-000000000001.webp`;
      const second = `${a}/20000000-0000-4000-8000-000000000002.webp`;
      async function storageAs(user: string, sql: string, params: string[]) {
        await db.exec("begin; set local role authenticated");
        try {
          await db.query("select set_config('request.jwt.claim.sub',$1,true)",[user]);
          const result = await db.query(sql,params); await db.exec("commit"); return result;
        } catch(error) { await db.exec("rollback"); throw error; }
      }
      const upload = "insert into storage.objects(bucket_id,name,owner_id,metadata) values('player-avatars',$1,$2,'{\"mimetype\":\"image/webp\"}')";
      await assert.rejects(storageAs(b,upload,[first,b]));
      await assert.rejects(storageAs(a,upload,[`${a}/../photo.webp`,a]));
      await storageAs(a,upload,[first,a]);
      await assert.rejects(asUser(b,"set_avatar",{path:first}));
      await assert.rejects(asUser(a,"set_avatar",{path:second}));
      await asUser(a,"set_avatar",{path:first});
      assert.equal((await asUser(a,"dashboard")).profile!.avatar_path,first);
      assert.equal((await storageAs(a,"delete from storage.objects where name=$1 returning name",[first])).rows.length,0);
      await storageAs(a,upload,[second,a]);
      assert.equal((await asUser<{previous_path:string}>(a,"set_avatar",{path:second})).previous_path,first);
      assert.equal((await storageAs(b,"delete from storage.objects where name=$1 returning name",[first])).rows.length,0);
      assert.equal((await storageAs(a,"delete from storage.objects where name=$1 returning name",[first])).rows.length,1);
      await asUser(a,"set_avatar",{path:""});
      assert.equal((await asUser(a,"dashboard")).profile!.avatar_path,null);
      assert.equal((await storageAs(a,"delete from storage.objects where name=$1 returning name",[second])).rows.length,1);
    });
    await asUser(a,"request_friend",{handle:"bob"});
    const relationship = (await asUser(b,"dashboard")).relationships[0];
    await t.test("only the recipient accepts; outsiders cannot remove; reciprocal requests stay unique", async () => {
      await assert.rejects(asUser(a,"accept_friend",{id:relationship.id}));
      await assert.rejects(asUser(c,"remove_friend",{id:relationship.id}));
      await asUser(b,"request_friend",{handle:"alice"});
      assert.equal((await asUser(a,"dashboard")).relationships.length,1);
      await asUser(b,"accept_friend",{id:relationship.id});
      assert.equal((await asUser(a,"dashboard")).relationships[0].status,"accepted");
      assert.equal((await asUser<{friend_status:string}>(a,"request_friend",{handle:"bob"})).friend_status,"accepted");
      assert.equal("real_name" in (await asUser(a,"dashboard")).relationships[0],false);
    });
    const {session_id} = await asUser<{session_id:string}>(a,"create_room",{title:"테스트 방",endpoint:"127.0.0.1:28080"});
    await t.test("only the host invites accepted friends and accesses host credentials", async () => {
      await assert.rejects(asUser(b,"host_bundle",{session_id}));
      await assert.rejects(asUser(b,"invite_friend",{session_id,user_id:c}));
      await assert.rejects(asUser(a,"invite_friend",{session_id,user_id:c}));
      await asUser(a,"invite_friend",{session_id,user_id:b});
    });
    const invite = (await asUser(b,"dashboard")).invites[0];
    await t.test("only accepted, unexpired invites produce a correctly signed five-minute ticket", async () => {
      await assert.rejects(asUser(b,"join_bundle",{id:invite.id}));
      await assert.rejects(asUser(c,"accept_invite",{id:invite.id}));
      await asUser(b,"accept_invite",{id:invite.id});
      const bundle = await asUser<Bundle>(b,"join_bundle",{id:invite.id});
      const host = await asUser<Bundle>(a,"host_bundle",{session_id});
      assert.ok(host.host_key);
      const [payload,signature] = bundle.ticket.split(".");
      assert.equal(signature,createHmac("sha256",host.host_key).update(payload).digest("hex"));
      assert.equal(payload.split("|")[0],session_id); assert.equal(payload.split("|")[1],b);
      assert.equal(Buffer.from(payload.split("|")[4],"hex").toString("utf8"),"친구 bob");
      assert.ok(bundle.expires_at <= Date.now()/1000+301);
      assert.equal(bundle.host_key,undefined);
      assert.ok(!JSON.stringify(await asUser(b,"dashboard")).includes(host.host_key));
      await db.query("update public.game_invites set expires_at=now()-interval '1 second' where id=$1",[invite.id]);
      await assert.rejects(asUser(b,"join_bundle",{id:invite.id}));
    });
    await t.test("blocking deletes friendship and invitations in both directions", async () => {
      await asUser(a,"invite_friend",{session_id,user_id:b});
      await asUser(b,"block_user",{handle:"alice"});
      assert.equal((await asUser(a,"dashboard")).relationships.length,0);
      assert.equal((await asUser(b,"dashboard")).invites.length,0);
      await assert.rejects(asUser(a,"request_friend",{handle:"bob"}));
      await assert.rejects(asUser(b,"request_friend",{handle:"alice"}));
      assert.deepEqual(await asUser(a,"search_players",{query:"bob"}),[]);
      assert.deepEqual(await asUser(b,"search_players",{query:"alice"}),[]);
      await assert.rejects(asUser(a,"invite_friend",{session_id,user_id:b}));
      await asUser(b,"unblock_user",{user_id:a});
      assert.equal((await asUser(b,"dashboard")).relationships.length,0);
    });
    await t.test("creating a new room closes the old one; closed rooms issue no more bundles", async () => {
      await asUser(a,"create_room",{title:"새 방",endpoint:"[::1]:28081"});
      await assert.rejects(asUser(a,"host_bundle",{session_id}));
      const room = (await asUser(a,"dashboard")).rooms[0];
      await assert.rejects(asUser(b,"close_room",{session_id:room.id}));
      await asUser(a,"close_room",{session_id:room.id});
      assert.equal((await asUser(a,"dashboard")).rooms.length,0);
    });
  } finally { await db.close(); }
});
