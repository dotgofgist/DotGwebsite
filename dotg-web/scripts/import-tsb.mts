import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { validateProjectFormData } from "../src/features/projects/validation.ts";
import { createProjectThumbnailPath } from "../src/lib/supabase/storage.ts";
import { validateImageFile } from "../src/lib/supabase/storage-validation.ts";
import { PROJECT_IMAGES_BUCKET, PROJECT_THUMBNAIL_MAX_BYTES, PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS } from "../src/lib/supabase/storage-constants.ts";
import type { Database } from "../src/lib/supabase/database.types.ts";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const game = JSON.parse(readFileSync(resolve(app, "content/tsb-v0.1.json"), "utf8"));
const form = new FormData();
for (const [name, value] of Object.entries({
  title: game.title, slug: game.slug, summary: game.summary, description: game.description,
  status: game.status, publicationStatus: game.publicationStatus, startedAt: game.startedAt,
  releasedAt: game.releasedAt, tags: game.tags.join(","), sortOrder: "0", members: "",
  links: game.links.map((link: { type: string; label: string; href: string }) => `${link.type}|${link.label}|${link.href}`).join("\n"),
})) form.set(name, String(value));
const validation = validateProjectFormData(form);
if (!validation.ok) throw new Error(JSON.stringify(validation.state));
if (game.publishedAt !== "2026-11-21T00:00:00+09:00") throw new Error("Unexpected publication date.");
const bytes = readFileSync(resolve(app, `public${game.cover}`));
const image = await validateImageFile(new File([bytes], "tsb-v0.1.png", { type: "image/png" }), {
  maxBytes: PROJECT_THUMBNAIL_MAX_BYTES, fieldName: "Project cover", dimensions: PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
});
if (!image.ok) throw new Error(image.message);
console.log(JSON.stringify({ slug: game.slug, title: game.title, status: game.status, startedAt: game.startedAt,
  releasedAt: game.releasedAt, publishedAt: game.publishedAt, coverBytes: bytes.length, dimensions: image.dimensions }));
if (!process.argv.includes("--apply")) {
  console.log("DRY RUN: content and cover validated; no network requests or writes.");
} else {
  nextEnv.loadEnvConfig(app);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Supabase URL is missing.");
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    const ref = readFileSync(resolve(app, "supabase/.temp/project-ref"), "utf8").trim();
    if (new URL(url).hostname !== `${ref}.supabase.co`) throw new Error("Linked Supabase project does not match the website.");
    const cli = resolve(app, "node_modules/.pnpm/@supabase+cli-windows-x64@2.109.1/node_modules/@supabase/cli-windows-x64/bin/supabase.exe");
    const result = spawnSync(cli, ["projects", "api-keys", "--project-ref", ref, "--output", "json"], {
      cwd: app, encoding: "utf8", timeout: 60_000, env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    });
    if (result.status !== 0) throw new Error("Existing Supabase CLI login unavailable; sensitive output withheld.");
    key = JSON.parse(result.stdout).find((item: { name: string }) => item.name === "service_role")?.api_key;
  }
  if (!key) throw new Error("Supabase management credential unavailable.");
  const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const prior = await db.from("projects").select("id, slug, publication_status").eq("slug", game.slug).maybeSingle();
  if (prior.error) throw new Error(prior.error.message);
  if (prior.data) throw new Error(`Project already exists (${prior.data.id}); refusing duplicate or overwrite.`);
  for (const link of validation.values.links) {
    const response = await fetch(link.href, { method: "HEAD", signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Link returned HTTP ${response.status}: ${link.href}`);
  }
  const id = randomUUID();
  const path = createProjectThumbnailPath(id, "png");
  const inserted = await db.from("projects").insert({ id, slug: game.slug, title: game.title,
    summary: game.summary, description: game.description, status: validation.values.status,
    publication_status: "draft", started_at: game.startedAt, released_at: game.releasedAt,
    tags: game.tags, featured: false });
  if (inserted.error) throw new Error(inserted.error.message);
  let uploaded = false;
  let published = false;
  try {
    const upload = await db.storage.from(PROJECT_IMAGES_BUCKET).upload(path, bytes, {
      contentType: "image/png", cacheControl: "3600", upsert: false,
    });
    if (upload.error) throw new Error(upload.error.message);
    uploaded = true;
    const links = await db.from("project_links").insert(validation.values.links.map((link, sort_order) => ({
      project_id: id, link_type: link.type, label: link.label, url: link.href, sort_order,
    })));
    if (links.error) throw new Error(links.error.message);
    const result = await db.from("projects").update({ thumbnail_path: path, publication_status: "published",
      published_at: game.publishedAt }).eq("id", id).eq("publication_status", "draft").select("id,slug,started_at,released_at,published_at,publication_status").single();
    if (result.error) throw new Error(result.error.message);
    published = true;
    const publicUrl = db.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    console.log(JSON.stringify({ project: result.data, coverUrl: publicUrl,
      url: `https://www.dotgsince2023.co.kr/projects/${game.slug}` }));
  } catch (error) {
    if (!published) {
      const rollback = await db.from("projects").delete().eq("id", id).eq("publication_status", "draft").select("id");
      if (rollback.error || rollback.data?.length !== 1) console.error(`Inspect draft ${id}; rollback incomplete.`);
      else if (uploaded) {
        const removed = await db.storage.from(PROJECT_IMAGES_BUCKET).remove([path]);
        if (removed.error) console.error(`Unused cover remains at ${path}.`);
      }
    }
    throw error;
  }
}
