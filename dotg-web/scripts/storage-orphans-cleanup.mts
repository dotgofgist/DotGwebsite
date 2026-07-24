import { spawnSync } from "node:child_process";

const mode = process.argv.includes("--remote") ? "--remote" : "--local";
const apply = process.argv.includes("--apply");
const file = apply
  ? "supabase/snippets/storage-orphans-delete.sql"
  : "supabase/snippets/storage-orphans-check.sql";

const args = [
  "--experimental-strip-types",
  "scripts/run-supabase-sql.mts",
  mode,
  "--file",
  file,
];

if (apply) {
  args.push("--allow-mutation");
} else {
  console.log("[DotG Storage] Dry run only. Re-run with --apply to delete listed orphan rows older than 10 minutes.");
}

const result = spawnSync(process.execPath, args, {
  cwd: process.cwd(),
  encoding: "utf8",
  env: process.env,
  stdio: "inherit",
});

process.exitCode = result.status ?? 1;
