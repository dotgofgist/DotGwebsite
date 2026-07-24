import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const fileIndex = process.argv.indexOf("--file");
const file = fileIndex >= 0 ? process.argv[fileIndex + 1] : undefined;
const mode = process.argv.includes("--remote") ? "remote" : "local";
const allowMutation = process.argv.includes("--allow-mutation");

if (!file) {
  console.error("Usage: node scripts/run-supabase-sql.mts --local|--remote --file <path> [--allow-mutation]");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");
const mutationPattern = /^\s*(insert|update|delete|truncate|drop|alter|create|grant|revoke)\b/im;
const supabaseBin =
  process.platform === "win32"
    ? ".\\node_modules\\.bin\\supabase.cmd"
    : "./node_modules/.bin/supabase";

if (!allowMutation && mutationPattern.test(sql)) {
  console.error(
    `[DotG Supabase] ${file} contains mutation-like SQL. Re-run with --allow-mutation only when this is intentional.`,
  );
  process.exit(1);
}

const args = [
  "db",
  "query",
  mode === "remote" ? "--linked" : "--local",
  "--file",
  file,
];

const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : supabaseBin;
const commandArgs =
  process.platform === "win32"
    ? ["/d", "/c", `${supabaseBin} ${args.join(" ")}`]
    : args;
const result = spawnSync(command, commandArgs, {
  cwd: process.cwd(),
  encoding: "utf8",
  env: {
    ...process.env,
    SUPABASE_TELEMETRY_DISABLED: "1",
  },
  shell: false,
  stdio: "inherit",
});

process.exitCode = result.status ?? 1;
