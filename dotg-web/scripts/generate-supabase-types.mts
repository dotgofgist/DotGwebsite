import { mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const mode = process.argv.includes("--remote") ? "remote" : "local";
const target = "src/lib/supabase/database.types.ts";
const tempDir = mkdtempSync(join(tmpdir(), "dotg-supabase-types-"));
const tempFile = join(tempDir, "database.types.ts");
const supabaseBin =
  process.platform === "win32"
    ? ".\\node_modules\\.bin\\supabase.cmd"
    : "./node_modules/.bin/supabase";
const supabaseArgs = [
  "gen",
  "types",
  "--lang",
  "typescript",
  mode === "remote" ? "--linked" : "--local",
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

try {
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.stderr.write(result.stdout);
    process.exitCode = result.status ?? 1;
    throw new Error(`Supabase ${mode} type generation failed.`);
  }

  const output = result.stdout.trimStart();

  if (!output.startsWith("export type Json")) {
    process.exitCode = 1;
    throw new Error("Generated Supabase types did not look like TypeScript output; existing file was left untouched.");
  }

  writeFileSync(tempFile, result.stdout);

  const previous = readFileSync(target, "utf8");

  if (previous === result.stdout) {
    console.log(`[DotG Supabase] ${mode} types are already up to date.`);
  } else {
    renameSync(tempFile, target);
    console.log(`[DotG Supabase] Wrote ${mode} types to ${target}.`);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
