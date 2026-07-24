import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const target = "src/lib/supabase/database.types.ts";
const supabaseBin =
  process.platform === "win32"
    ? ".\\node_modules\\.bin\\supabase.cmd"
    : "./node_modules/.bin/supabase";
const supabaseArgs = [
  "gen",
  "types",
  "--lang",
  "typescript",
  "--local",
  "--schema",
  "public",
];

const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : supabaseBin;
const commandArgs =
  process.platform === "win32"
    ? ["/d", "/c", `${supabaseBin} ${supabaseArgs.join(" ")}`]
    : supabaseArgs;

const result = spawnSync(command, commandArgs, {
  cwd: process.cwd(),
  encoding: "utf8",
  env: {
    ...process.env,
    SUPABASE_TELEMETRY_DISABLED: "1",
  },
  shell: false,
});

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.stderr.write(result.stdout);
  process.exit(result.status ?? 1);
}

const generated = result.stdout.trimStart();

if (!generated.startsWith("export type Json")) {
  console.error("[DotG Supabase] Generated types did not look like TypeScript output.");
  process.exit(1);
}

const current = readFileSync(target, "utf8");

if (current !== result.stdout) {
  console.error("[DotG Supabase] database.types.ts is out of date.");
  console.error("Run: pnpm run supabase:types");
  console.error(`Commit the updated ${target}.`);
  process.exit(1);
}

console.log("[DotG Supabase] database.types.ts is up to date.");
