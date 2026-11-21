/** Update only the existing TSB download link; retain the v0.1 label. */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types.ts";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const game = JSON.parse(readFileSync(resolve(app, "content/tsb-v0.1.json"), "utf8"));
const canonical = "https://github.com/pinata0/Fyrox-TSB/releases/download/v0.1/TSB.exe";
nextEnv.loadEnvConfig(app);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error("Supabase URL is missing.");
let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) {
  const ref = readFileSync(resolve(app, "supabase/.temp/project-ref"), "utf8").trim();
  if (new URL(url).hostname !== `${ref}.supabase.co`) throw new Error("Linked project does not match website.");
  const cli = resolve(app, "node_modules/.pnpm/@supabase+cli-windows-x64@2.109.1/node_modules/@supabase/cli-windows-x64/bin/supabase.exe");
  const result = spawnSync(cli, ["projects", "api-keys", "--project-ref", ref, "--output", "json"], {
    cwd: app, encoding: "utf8", timeout: 60_000,
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" }, windowsHide: true,
  });
  if (result.status !== 0) throw new Error("Existing Supabase CLI login unavailable; sensitive output withheld.");
  key = JSON.parse(result.stdout).find((item: { name: string }) => item.name === "service_role")?.api_key;
}
if (!key) throw new Error("Supabase management credential unavailable.");
const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const project = await db.from("projects").select("id,slug,publication_status")
  .eq("slug", "trickcal-shooting-balddagu").eq("id", "dcdd6b6d-9545-44fb-81ac-d866fe6ee32a").single();
if (project.error) throw new Error(project.error.message);
const prior = await db.from("project_links").select("id,label,url,link_type")
  .eq("project_id", project.data.id).eq("link_type", "download").single();
if (prior.error) throw new Error(prior.error.message);
console.log(JSON.stringify({ project: project.data, download: prior.data }));
if (process.argv.includes("--apply")) {
  const target = game.links.find((link: { type: string }) => link.type === "download");
  const hash = game.downloadSha256;
  if (game.slug !== project.data.slug || !/^[0-9a-f]{64}$/.test(hash)
      || target.href !== `${canonical}?build=${hash.slice(0, 12)}`
      || target.label !== "Windows v0.1 다운로드") throw new Error("Unexpected hotfix download metadata.");
  if (prior.data.url !== canonical && prior.data.url !== target.href) throw new Error("Download link changed; inspect before updating.");
  const releaseResponse = await fetch("https://api.github.com/repos/pinata0/Fyrox-TSB/releases/tags/v0.1");
  if (!releaseResponse.ok) throw new Error(`Release verification failed: ${releaseResponse.status}`);
  const release = await releaseResponse.json();
  const asset = release.assets.find((item: { name: string }) => item.name === "TSB.exe");
  if (!asset || asset.digest !== `sha256:${hash}` || asset.state !== "uploaded" || release.draft) {
    throw new Error("Public release does not contain the verified hotfix.");
  }
  const response = await fetch(target.href, { method: "HEAD", signal: AbortSignal.timeout(30_000) });
  if (!response.ok || Number(response.headers.get("content-length")) !== asset.size) {
    throw new Error("Hotfix download URL failed validation.");
  }
  const result = await db.from("project_links").update({ url: target.href })
    .eq("id", prior.data.id).eq("project_id", project.data.id).eq("url", prior.data.url)
    .select("id,label,url").single();
  if (result.error) throw new Error(result.error.message);
  console.log(JSON.stringify({ updated: result.data, version: "v0.1", sha256: hash }));
} else {
  console.log("INSPECT ONLY: no writes.");
}
