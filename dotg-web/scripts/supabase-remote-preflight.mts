import { existsSync, readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const supabaseBin =
  process.platform === "win32"
    ? ".\\node_modules\\.bin\\supabase.cmd"
    : "./node_modules/.bin/supabase";

function run(command: string, args: string[], required: boolean): string {
  const actualCommand =
    process.platform === "win32" && command.endsWith(".cmd")
      ? (process.env.ComSpec ?? "cmd.exe")
      : command;
  const actualArgs =
    process.platform === "win32" && command.endsWith(".cmd")
      ? ["/d", "/c", `${command} ${args.join(" ")}`]
      : args;
  const result = spawnSync(actualCommand, actualArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      SUPABASE_TELEMETRY_DISABLED: "1",
    },
    shell: false,
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.message ?? ""}`.trim();

  if (result.status === 0) {
    console.log(`PASS ${command} ${args.join(" ")}`);
    if (output.length > 0) {
      console.log(output);
    }
    return output;
  }

  const label = required ? "FAIL" : "WARN";
  console.log(`${label} ${command} ${args.join(" ")}`);
  if (output.length > 0) {
    console.log(output);
  }

  if (required) {
    process.exitCode = result.status ?? 1;
  }

  return output;
}

const remote = process.argv.includes("--remote");
const requireCleanGit = process.argv.includes("--require-clean-git");

run(supabaseBin, ["--version"], true);

const gitStatus = run("git", ["status", "--short"], false);
if (requireCleanGit && gitStatus.length > 0) {
  console.log("FAIL working tree is not clean.");
  process.exitCode = 1;
}

const migrations = readdirSync("supabase/migrations")
  .filter((name) => name.endsWith(".sql"))
  .sort();
console.log(`PASS local migrations: ${migrations.join(", ")}`);

const config = readFileSync("supabase/config.toml", "utf8");
if (!config.includes('sql_paths = ["./seed.sql"]')) {
  console.log("FAIL local db reset seed path is not supabase/seed.sql.");
  process.exitCode = 1;
} else {
  console.log("PASS local db reset uses development seed only.");
}

if (!existsSync("supabase/seeds/production.sql")) {
  console.log("FAIL production seed file is missing.");
  process.exitCode = 1;
} else {
  console.log("PASS production seed is separated from development seed.");
}

if (remote) {
  run(supabaseBin, ["projects", "list"], false);
  run(supabaseBin, ["migration", "list", "--linked"], true);
} else {
  console.log("INFO remote checks skipped. Re-run with --remote after supabase login and supabase link.");
}
