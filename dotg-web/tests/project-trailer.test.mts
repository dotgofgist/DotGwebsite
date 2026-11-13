import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { parseProjectTrailerUrl } from "../src/features/projects/trailer.ts";
import { validateProjectFormData } from "../src/features/projects/validation.ts";
import { mapProjectRowToAdminProject } from "../src/features/projects/admin-mappers.ts";
import type { AdminProjectRowWithRelations } from "../src/features/projects/admin-mappers.ts";

const videoId = "M7lc1UVf-VE";
const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

test("YouTube share, watch, mobile, Shorts, live and embed links become a single safe embed", () => {
  for (const url of [
    watchUrl,
    ` https://youtu.be/${videoId}?si=shared `,
    `https://m.youtube.com/watch?v=${videoId}&autoplay=1`,
    `https://youtube.com/shorts/${videoId}`,
    `https://www.youtube.com/live/${videoId}`,
    `https://www.youtube.com/embed/${videoId}`,
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  ]) {
    assert.deepEqual(parseProjectTrailerUrl(url), {
      kind: "youtube", url: watchUrl, src: `https://www.youtube-nocookie.com/embed/${videoId}`,
    });
  }
});

test("direct media keeps signed query strings and rejects unsafe or unsupported URLs", () => {
  for (const url of ["https://cdn.example.com/trailer.mp4?token=signed#t=10", "https://cdn.example.com/TRAILER.WEBM"]) {
    assert.deepEqual(parseProjectTrailerUrl(url), { kind: "video", url, src: url });
  }
  for (const url of [
    "", "not a url", "javascript:alert(1)", "data:video/mp4;base64,AAAA",
    "http://cdn.example.com/trailer.mp4", "//cdn.example.com/trailer.mp4",
    "https://user:secret@cdn.example.com/trailer.mp4",
    `https://youtube.com.evil.test/watch?v=${videoId}`,
    `https://youtube.com@evil.test/watch?v=${videoId}`,
    `https://youtube.com:8443/watch?v=${videoId}`,
    "https://www.youtube.com/watch?v=invalid", "https://www.youtube.com/playlist?list=123",
    `https://youtu.be/${videoId}/extra`, "https://cdn.example.com/trailer.mp4.html",
    `https://cdn.example.com/${"x".repeat(2048)}.mp4`,
  ]) assert.equal(parseProjectTrailerUrl(url), undefined, url);
});

test("project forms normalize trailers, reject invalid input and allow removing the trailer", () => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ title: "Project", slug: "project", summary: "Summary", description: "Description", status: "planning", publicationStatus: "draft" })) form.set(key, value);
  for (const input of [undefined, "", "   ", ` https://youtu.be/${videoId} `, "https://cdn.example.com/trailer.mp4"]) {
    if (input === undefined) form.delete("trailerUrl");
    else form.set("trailerUrl", input);
    const result = validateProjectFormData(form);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.values.trailerUrl, input?.trim() ? parseProjectTrailerUrl(input)?.url : undefined);
  }
  form.set("trailerUrl", "https://example.com/not-a-video");
  const result = validateProjectFormData(form);
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.state.fieldErrors?.trailerUrl);
});

test("trailer migration preserves old projects and supports saving, reading, replacing and clearing", async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(`create schema extensions; create schema auth;
      create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');`);
    await db.exec(readFileSync("supabase/migrations/20260723073310_create_initial_content_schema.sql", "utf8"));
    await db.exec("insert into public.projects(slug,title,summary,description) values('existing','Existing','Summary','Description')");
    await db.exec(readFileSync("supabase/migrations/20261113100000_add_project_trailer.sql", "utf8"));
    const readProject = async () => (await db.query<AdminProjectRowWithRelations>("select * from public.projects where slug='existing'")).rows[0];
    assert.equal((await readProject()).trailer_url, null);
    for (const url of [watchUrl, "https://cdn.example.com/trailer.webm", null]) {
      await db.query("update public.projects set trailer_url=$1 where slug='existing'", [url]);
      const row = await readProject();
      assert.equal(row.trailer_url, url);
      assert.equal(mapProjectRowToAdminProject(row).trailerUrl, url ?? undefined);
    }
    for (const url of ["", "javascript:alert(1)", "http://example.com/trailer.mp4", "https://example.com/bad url.mp4", `https://example.com/${"x".repeat(2048)}.mp4`]) {
      await assert.rejects(db.query("update public.projects set trailer_url=$1 where slug='existing'", [url]));
    }
  } finally { await db.close(); }
});
