import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { validateNativeRequest } from "../src/features/game-social/native.ts";
import type { SocialDashboard } from "../src/features/game-social/types.ts";
import { validateRoomRequest, type ListedRoom } from "../src/features/game-social/rooms.ts";

type SessionBundle = { address: string; transport: string; mode: string };
type RoomResponses = {
  link_begin: { token: string; code: string };
  link_status: { connected: boolean; display_name: string | null; handle: string | null; avatar: string | null; avatar_path: string | null; real_name?: never };
  link_approve: { ok: boolean };
  list: { rooms: (ListedRoom & Record<string, unknown>)[] };
  create: { code: string; session: SessionBundle & { host_key: string } };
  join: { session: SessionBundle & { ticket: string; host_key?: never } };
  heartbeat: { ok: boolean };
  close: { ok: boolean };
};

test("room requests validate codes, endpoints, fields and player bounds", () => {
  assert.equal(validateRoomRequest({action:"join",payload:{code:"ab12-34ef"}}).payload.code,"AB1234EF");
  for (const payload of [{code:"ZZZZZZZZ"},{code:"ABC12345",token:"short"}]) assert.throws(()=>validateRoomRequest({action:"join",payload}));
  for (const endpoint of ["0.0.0.0:28080","[::]:28080","localhost:0","host:65536","https://host"]) {
    assert.throws(()=>validateRoomRequest({action:"create",payload:{title:"방",token:"a".repeat(64),endpoint,map_id:"elf-city"}}));
  }
  for(const players of ["0","13","-1","NaN"]) assert.throws(()=>validateRoomRequest({action:"heartbeat",payload:{token:"a".repeat(64),code:"ABC12345",map_id:"elf-city",players,state:"waiting"}}));
});

test("live directory pairs devices, binds host ownership, signs joins and expires stale rooms", async t => {
  const db = new PGlite({extensions:{pgcrypto}});
  const alice="10000000-0000-4000-8000-000000000001", bob="10000000-0000-4000-8000-000000000002";
  try {
    await db.exec(`create schema extensions; create schema auth; create role anon; create role authenticated; create role service_role;
      create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner_id text,metadata jsonb,unique(bucket_id,name));
      alter table storage.objects enable row level security;`);
    for(const name of ["20260723073310_create_initial_content_schema.sql","20260723073320_add_initial_rls_policies.sql","20261113090000_add_game_social.sql","20261113110000_add_game_room_directory.sql","20261113120000_add_eos_p2p_rooms.sql","20261114090000_add_player_account_settings.sql","20261115090000_add_native_player_profile.sql","20261115100000_add_native_social.sql"]){
      await db.exec(readFileSync(`supabase/migrations/${name}`,"utf8"));
    }
    await db.query("insert into auth.users(id) values($1),($2)",[alice,bob]);
    await db.query("insert into public.game_profiles(id,handle,display_name) values($1,'alice','방장'),($2,'bob','참가자')",[alice,bob]);
    async function call<Action extends keyof RoomResponses>(action:Action,payload:Record<string,string>={},user=""):Promise<RoomResponses[Action]> {
      await db.exec(`begin; set local role ${user?"authenticated":"anon"}`);
      try {
        await db.query("select set_config('request.jwt.claim.sub',$1,true)",[user]);
        const result=await db.query<{value:RoomResponses[Action]}>("select public.game_rooms($1,$2::jsonb) as value",[action,JSON.stringify(payload)]);
        await db.exec("commit");return result.rows[0].value;
      }catch(e){await db.exec("rollback");throw e;}
    }
    const host=await call("link_begin"), guest=await call("link_begin");
    await t.test("approval requires a profile, cannot be stolen or repeated, and tokens stay private",async()=>{
      assert.equal((await call("link_status",{token:host.token})).connected,false);
      await assert.rejects(call("link_approve",{code:host.code}));
      await call("link_approve",{code:host.code},alice);
      await assert.rejects(call("link_approve",{code:host.code},bob));
      await call("link_approve",{code:guest.code},bob);
      assert.equal((await call("link_status",{token:host.token})).display_name,"방장");
      await assert.rejects(call("link_status",{token:"a".repeat(64)}));
      await db.exec("begin; set local role anon");
      await assert.rejects(db.exec("select * from game_private.game_devices"));await db.exec("rollback");
    });
    await t.test("linked devices receive their current public card and avatar changes without private account fields",async()=>{
      const photo = `${alice}/20000000-0000-4000-8000-000000000001.webp`;
      const pending = await call("link_begin");
      const waiting = await call("link_status",{token:pending.token});
      assert.equal(waiting.connected,false); assert.equal(waiting.avatar_path,null);
      assert.equal(waiting.display_name,null); assert.equal(waiting.handle,null);
      await db.query("update public.game_profiles set avatar_path=$1,avatar='mint',real_name='비공개 이름',display_name='새 닉네임' where id=$2",[photo,alice]);
      // Even an unrelated browser identity cannot override the device's owner.
      const profile = await call("link_status",{token:host.token},bob);
      assert.deepEqual(profile,{connected:true,display_name:"새 닉네임",handle:"alice",avatar:"mint",avatar_path:photo});
      assert.equal((await call("link_status",{token:guest.token})).avatar_path,null);
      await db.query("update public.game_profiles set avatar_path=null,display_name='방장' where id=$1",[alice]);
      assert.equal((await call("link_status",{token:host.token})).avatar_path,null);
      await assert.rejects(call("link_status",{},alice));
      await db.query("update game_private.game_devices set expires_at=now()-interval '1 second' where code=$1",[pending.code]);
      await assert.rejects(call("link_status",{token:pending.token}));
    });
    async function native<T = SocialDashboard>(token: string, action: string, payload: Record<string, string> = {}, cookieUser = ""): Promise<T> {
      await db.exec("begin; set local role anon");
      try {
        await db.query("select set_config('request.jwt.claim.sub',$1,true)",[cookieUser]);
        const result=await db.query<{value:T}>("select public.game_native_social($1,$2::jsonb) as value",[action,JSON.stringify({...payload,token})]);
        await db.exec("commit"); return result.rows[0].value;
      } catch(error) {await db.exec("rollback");throw error;}
    }
    await t.test("native tokens scope identity, edits and friend consent without cookie fallback",async()=>{
      await assert.rejects(native("","dashboard",{},alice));
      await assert.rejects(native("a".repeat(64),"dashboard",{},alice));
      const pending=await call("link_begin");
      await assert.rejects(native(pending.token,"dashboard"));
      const own=await native(host.token,"dashboard",{},bob);
      assert.equal(own.profile?.handle,"alice");
      await native(host.token,"save_profile",{handle:"alice",real_name:"내 이름",display_name:"게임 닉네임",bio:"인게임 소개",avatar:"blue",id:bob,role:"admin"});
      assert.equal((await call("link_status",{token:host.token})).display_name,"게임 닉네임");
      assert.equal((await native(guest.token,"dashboard")).profile?.display_name,"참가자");
      const search=await native<Array<Record<string,unknown>>>(guest.token,"search_players",{query:"alice"});
      assert.equal(search[0].display_name,"게임 닉네임");assert.equal(search[0].real_name,undefined);
      await native(host.token,"request_friend",{handle:"bob"});
      const request=(await native(guest.token,"dashboard")).relationships[0];
      assert.equal(request.incoming,true);
      await assert.rejects(native(host.token,"accept_friend",{id:request.id}));
      await native(guest.token,"accept_friend",{id:request.id});
      assert.equal((await native(host.token,"dashboard")).relationships[0].status,"accepted");
      await native(host.token,"block_user",{handle:"bob"});
      assert.equal((await native(host.token,"dashboard")).relationships.length,0);
      assert.deepEqual(await native(guest.token,"search_players",{query:"alice"}),[]);
      await native(host.token,"unblock_user",{user_id:bob});
      for(const action of ["set_avatar","host_bundle","create_room","close_room","join_bundle","admin"]) await assert.rejects(native(host.token,action));
      await db.exec("begin; set local role anon");
      await assert.rejects(db.exec("select game_private.social_for_player(null,'dashboard','{}')"));await db.exec("rollback");
      await native(host.token,"save_profile",{handle:"alice",real_name:"내 이름",display_name:"방장",bio:"",avatar:"mint"});
      await db.query("update game_private.game_devices set expires_at=now()-interval '1 second' where code=$1",[pending.code]);
      await assert.rejects(native(pending.token,"dashboard"));
    });
    const created=await call("create",{token:host.token,title:"함께 플레이",endpoint:"127.0.0.1:28080",map_id:"elf-city"});
    await t.test("native invitations join inside the game and enforce room capacity",async()=>{
      await native(host.token,"request_friend",{handle:"bob"});
      const request=(await native(guest.token,"dashboard")).relationships[0];
      await native(guest.token,"accept_friend",{id:request.id});
      const room=(await native(host.token,"dashboard")).rooms[0];
      await native(host.token,"invite_friend",{session_id:room.id,user_id:bob});
      const invite=(await native(guest.token,"dashboard")).invites[0];
      await assert.rejects(native(host.token,"join_invite",{id:invite.id}));
      await db.exec("update game_private.room_presence set players=12");
      await assert.rejects(native(guest.token,"join_invite",{id:invite.id}));
      await db.exec("update game_private.room_presence set players=1");
      const joined=await native<{code:string,session:{mode:string,ticket:string,host_key?:never}}>(guest.token,"join_invite",{id:invite.id});
      assert.equal(joined.code,created.code);assert.equal(joined.session.mode,"join");assert.equal(joined.session.host_key,undefined);
      const [body,signature]=joined.session.ticket.split(".");
      assert.equal(signature,createHmac("sha256",created.session.host_key).update(body).digest("hex"));
      await native(guest.token,"decline_invite",{id:invite.id});
      assert.equal((await native(guest.token,"dashboard")).invites.length,0);
    });
    await t.test("listing exposes only room metadata; joining uses signed credentials",async()=>{
      const listed=(await call("list")).rooms;
      assert.equal(listed.length,1);assert.equal(listed[0].code,created.code);assert.equal(listed[0].players,1);
      for(const key of ["endpoint","host_key","token","session_id","device_hash"])assert.equal(listed[0][key],undefined);
      await assert.rejects(call("join",{code:created.code}));
      const join=await call("join",{token:guest.token,code:created.code.toLowerCase()});
      const [payload,signature]=join.session.ticket.split(".");
      assert.equal(signature,createHmac("sha256",created.session.host_key).update(payload).digest("hex"));
      assert.equal(payload.split("|")[1],bob);assert.equal(join.session.host_key,undefined);
      assert.equal((await call("join",{code:created.code},bob)).session.mode,"join");
    });
    await t.test("only the creating device updates/closes; capacity, blocking and stale state deny entry",async()=>{
      const pulse={token:host.token,code:created.code,map_id:"fairy-kingdom-castle",players:"12",state:"playing"};
      await assert.rejects(call("heartbeat",{...pulse,token:guest.token}));
      await assert.rejects(call("close",{token:guest.token,code:created.code}));
      await call("heartbeat",pulse);
      assert.equal((await call("list")).rooms[0].state,"playing");
      await assert.rejects(call("join",{token:guest.token,code:created.code}));
      await call("heartbeat",{...pulse,players:"2"});
      await db.query("insert into public.game_blocks values($1,$2)",[alice,bob]);
      await assert.rejects(call("join",{token:guest.token,code:created.code}));
      await db.exec("delete from public.game_blocks; update game_private.room_presence set last_seen=now()-interval '61 seconds'");
      assert.equal((await call("list")).rooms.length,0);
      await assert.rejects(call("join",{token:guest.token,code:created.code}));
      await call("heartbeat",{...pulse,players:"2"});assert.equal((await call("list")).rooms.length,1);
      await call("close",{token:host.token,code:created.code});assert.equal((await call("list")).rooms.length,0);
      await assert.rejects(call("heartbeat",pulse));
      await assert.rejects(call("join",{token:guest.token,code:created.code}));
    });
    await t.test("EOS rooms preserve their peer endpoint and signed admission through the live directory", async () => {
      await db.exec("update public.game_sessions set created_at=now()-interval '1 minute'");
      const endpoint=`eos:${"a".repeat(32)}:${"b".repeat(32)}`;
      const payload={token:host.token,title:"EOS 방",endpoint,map_id:"elf-city"};
      assert.equal(validateRoomRequest({action:"create",payload}).payload.endpoint,endpoint);
      for(const invalid of ["eos:x:y", `eos:${"0".repeat(32)}:${"b".repeat(32)}`, `${endpoint}:extra`]) {
        await assert.rejects(call("create",{...payload,endpoint:invalid}));
      }
      const room=await call("create",payload);
      assert.equal(room.session.transport,"eos_p2p");
      assert.equal(room.session.address,endpoint);
      const joined=await call("join",{token:guest.token,code:room.code});
      assert.equal(joined.session.transport,"eos_p2p");
      assert.equal(joined.session.address,endpoint);
      const [body,signature]=joined.session.ticket.split(".");
      assert.equal(signature,createHmac("sha256",room.session.host_key).update(body).digest("hex"));
      assert.equal(joined.session.host_key,undefined);
      await call("close",{token:host.token,code:room.code});
    });
    await t.test("EOS hosts and signed joins retain the complete transport code",async()=>{
      await db.exec("update public.game_sessions set created_at=now()-interval '10 seconds'");
      const endpoint=`eos:${"1".repeat(32)}:${"2".repeat(32)}`;
      const eos=await call("create",{token:host.token,title:"EOS 방",endpoint,map_id:"elf-city"});
      assert.equal(eos.session.transport,"eos_p2p");assert.equal(eos.session.address,endpoint);
      const join=await call("join",{token:guest.token,code:eos.code});
      assert.equal(join.session.transport,"eos_p2p");assert.equal(join.session.address,endpoint);
    });
  } finally {await db.close();}
});

test("native HTTP payload validation requires a token and limits available actions",()=>{
  const token="a".repeat(64);
  assert.deepEqual(validateNativeRequest({action:"dashboard",payload:{token,id:"spoof"}}),{action:"dashboard",payload:{token}});
  for(const payload of [{},{token:"bad"},{token:7}]) assert.throws(()=>validateNativeRequest({action:"dashboard",payload}));
  for(const action of ["set_avatar","host_bundle","join_bundle","create_room","constructor"]) assert.throws(()=>validateNativeRequest({action,payload:{token}}));
  assert.throws(()=>validateNativeRequest({action:"search_players",payload:{token,query:"a"}}));
  assert.throws(()=>validateNativeRequest({action:"join_invite",payload:{token,id:"bad"}}));
});
