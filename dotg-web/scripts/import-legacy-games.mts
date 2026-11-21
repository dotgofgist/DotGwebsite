import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types.ts";
import { validateProjectFormData } from "../src/features/projects/validation.ts";
import { createProjectThumbnailPath } from "../src/lib/supabase/storage.ts";
import { validateImageFile } from "../src/lib/supabase/storage-validation.ts";
import {
  PROJECT_IMAGES_BUCKET,
  PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
  PROJECT_THUMBNAIL_MAX_BYTES,
} from "../src/lib/supabase/storage-constants.ts";

type Game = {
  slug: string; title: string; version: string; summary: string;
  description: string; tags: string[]; cover: string; archive: string;
  members: { name: string; role: string }[];
  downloadUrl?: string;
};

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const games: Game[] = JSON.parse(readFileSync(resolve(app, "content/legacy-games.json"), "utf8"));
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const downloadsIndex = args.indexOf("--downloads");
if (downloadsIndex >= 0 && !args[downloadsIndex + 1]) {
  throw new Error("--downloads requires a JSON file mapping game slugs to HTTPS download URLs.");
}
const downloads: Record<string, string> = downloadsIndex >= 0
  ? JSON.parse(readFileSync(resolve(args[downloadsIndex + 1]), "utf8"))
  : {};

// Validate every record and image before any remote writes.
const prepared = await Promise.all(games.map(async (game) => {
  const href = downloads[game.slug] ?? game.downloadUrl;
  if (href && new URL(href).protocol !== "https:") {
    throw new Error(`${game.slug}: download URLs must use HTTPS.`);
  }
  const form = new FormData();
  for (const [name, value] of Object.entries({
    title: game.title, slug: game.slug, summary: game.summary,
    description: game.description, status: "released", publicationStatus: "published",
    tags: game.tags.join(","), sortOrder: "0",
    members: game.members.map((member) => `${member.name}|${member.role}`).join("\n"),
    links: href ? `download|Windows v${game.version} 다운로드|${href}` : "",
  })) form.set(name, value);
  const validation = validateProjectFormData(form);
  if (!validation.ok) throw new Error(`${game.slug}: ${JSON.stringify(validation.state.fieldErrors)}`);
  const bytes = readFileSync(resolve(app, `public${game.cover}`));
  const imageValidation = await validateImageFile(new File([bytes], `${game.slug}.png`, { type: "image/png" }), {
    maxBytes: PROJECT_THUMBNAIL_MAX_BYTES,
    fieldName: "Project thumbnail",
    dimensions: PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
  });
  if (!imageValidation.ok) throw new Error(`${game.slug}: ${imageValidation.message}`);
  return { game, bytes, href };
}));

console.log(apply ? "Importing reviewed game records." : "DRY RUN — no network requests or writes.");
for (const { game, bytes, href } of prepared) {
  console.log(JSON.stringify({
    slug: game.slug, title: game.title, version: game.version,
    summary: game.summary, description: game.description, tags: game.tags,
    members: game.members,
    status: "released", publicationStatus: "published", cover: game.cover,
    coverBytes: bytes.length, archive: game.archive,
    download: href ? "Provided HTTPS URL" : "Not linked; package prepared separately",
  }, null, 2));
}

if (apply) {
  nextEnv.loadEnvConfig(app);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the process environment. Never commit the key.");
  }
  const supabase = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const existing = await supabase.from("projects").select("slug").in("slug", games.map((game) => game.slug));
  if (existing.error) throw new Error(`Preflight failed: ${existing.error.message}`);
  const existingSlugs = new Set(existing.data.map((row) => row.slug));

  if (args.includes("--upload-starflight") && !existingSlugs.has("starflight")) {
    const item = prepared.find(({ game }) => game.slug === "starflight")!;
    if (item.href) throw new Error("Use either --upload-starflight or a StarFlight download URL.");
    const archivePath = resolve(app, "artifacts/legacy-games", item.game.archive);
    const archiveBytes = readFileSync(archivePath);
    const manifest: { slug: string; bytes: number; sha256: string }[] = JSON.parse(
      readFileSync(resolve(app, "artifacts/legacy-games/manifest.json"), "utf8"),
    );
    const expected = manifest.find((entry) => entry.slug === "starflight");
    const checksum = createHash("sha256").update(archiveBytes).digest("hex");
    if (!expected || expected.bytes !== archiveBytes.length || expected.sha256 !== checksum) {
      throw new Error("StarFlight package checksum mismatch; run games:prepare again.");
    }
    const bucket = await supabase.storage.getBucket("downloads");
    if (bucket.error) throw new Error(bucket.error.message);
    const limit = Math.min(bucket.data.file_size_limit ?? Infinity, 100 * 1024 * 1024);
    if (archiveBytes.length > limit) throw new Error("StarFlight exceeds the downloads bucket limit.");
    const upload = await supabase.storage.from("downloads").upload(item.game.archive, archiveBytes, {
      contentType: "application/zip", cacheControl: "3600", upsert: false,
    });
    if (upload.error) throw new Error(`StarFlight upload: ${upload.error.message}`);
    item.href = supabase.storage.from("downloads").getPublicUrl(item.game.archive).data.publicUrl;
    console.log("StarFlight ZIP uploaded. If a later step fails, pass its public URL with --downloads when retrying.");
  }

  for (const { game, href } of prepared) {
    if (!href || existingSlugs.has(game.slug)) continue;
    const response = await fetch(href, { method: "HEAD", signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`${game.slug}: download URL returned ${response.status}.`);
  }

  for (const { game, bytes, href } of prepared) {
    if (existingSlugs.has(game.slug)) {
      console.log(`${game.slug}: already exists; left unchanged.`);
      continue;
    }
    const id = randomUUID();
    const path = createProjectThumbnailPath(id, "png");
    const inserted = await supabase.from("projects").insert({
      id, slug: game.slug, title: game.title, summary: game.summary,
      description: game.description, status: "released", publication_status: "draft",
      tags: game.tags, featured: false,
    });
    if (inserted.error) throw new Error(`${game.slug}: ${inserted.error.message}`);

    let uploaded = false;
    try {
      const cover = await supabase.storage.from(PROJECT_IMAGES_BUCKET).upload(path, bytes, {
        contentType: "image/png", cacheControl: "3600", upsert: false,
      });
      if (cover.error) throw new Error(cover.error.message);
      uploaded = true;
      if (game.members.length > 0) {
        const members = await supabase.from("project_members").insert(
          game.members.map((member, sort_order) => ({ ...member, project_id: id, sort_order })),
        );
        if (members.error) throw new Error(members.error.message);
      }
      if (href) {
        const link = await supabase.from("project_links").insert({
          project_id: id, link_type: "download",
          label: `Windows v${game.version} 다운로드`, url: href,
        });
        if (link.error) throw new Error(link.error.message);
      }
      const published = await supabase.from("projects").update({
        thumbnail_path: path, publication_status: "published", published_at: new Date().toISOString(),
      }).eq("id", id).select("id").single();
      if (published.error) throw new Error(published.error.message);
      console.log(`${game.slug}: published with cover image.`);
    } catch (error) {
      // Only roll back records and objects created by this attempt.
      const rollback = await supabase.from("projects").delete().eq("id", id).eq("publication_status", "draft").select("id");
      if (rollback.error || rollback.data?.length !== 1) {
        console.error(`${game.slug}: rollback incomplete; inspect project ${id}.`);
      } else if (uploaded) {
        const removed = await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([path]);
        if (removed.error) console.error(`${game.slug}: unused cover remains at ${path}.`);
      }
      throw error;
    }
  }
}
