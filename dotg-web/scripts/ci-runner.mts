import { spawnSync } from "node:child_process";

const target = process.argv[2];

const commandSets: Record<string, string[][]> = {
  static: [
    ["pnpm", "lint"],
    ["pnpm", "exec", "tsc", "--noEmit"],
    ["pnpm", "run", "test:env"],
    ["pnpm", "run", "test:auth"],
    ["pnpm", "run", "test:admin"],
    ["pnpm", "run", "test:storage"],
    ["pnpm", "run", "test:supabase"],
    ["pnpm", "run", "supabase:migrations:check"],
    ["pnpm", "run", "secrets:scan"],
  ],
  database: [
    ["pnpm", "supabase", "start"],
    ["pnpm", "supabase", "db", "reset"],
    ["pnpm", "supabase", "test", "db"],
    ["pnpm", "run", "supabase:types:check"],
    ["pnpm", "run", "supabase:storage:check"],
    ["pnpm", "run", "supabase:rls:check"],
  ],
  build: [["pnpm", "build"]],
  e2e: [
    ["pnpm", "run", "e2e:preflight"],
    ["pnpm", "run", "test:e2e"],
  ],
  all: [
    ["pnpm", "run", "ci:static"],
    ["pnpm", "run", "ci:database"],
    ["pnpm", "run", "ci:build"],
    ["pnpm", "run", "ci:e2e"],
  ],
};

function fail(message: string): never {
  console.error(`[DotG CI] ${message}`);
  process.exit(1);
}

function redact(output: string): string {
  return output
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
    .replace(/\bsb_(?:secret|publishable)_[A-Za-z0-9_-]+/gi, "[redacted-supabase-key]")
    .replace(/("S3_PROTOCOL_ACCESS_KEY_SECRET":\s*")[^"]+(")/g, "$1[redacted]$2");
}

if (!target || !commandSets[target]) {
  fail(`Usage: node scripts/ci-runner.mts <${Object.keys(commandSets).join("|")}>`);
}

for (const [command, ...args] of commandSets[target]) {
  const executable = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : command;
  const executableArgs =
    process.platform === "win32"
      ? ["/d", "/c", [command === "pnpm" ? "pnpm.cmd" : command, ...args].join(" ")]
      : args;
  const capturesSensitiveOutput =
    command === "pnpm" && args[0] === "supabase" && args[1] === "start";
  console.log(`[DotG CI] Running: ${[command, ...args].join(" ")}`);

  const result = spawnSync(executable, executableArgs, {
    cwd: process.cwd(),
    encoding: capturesSensitiveOutput ? "utf8" : undefined,
    env: {
      ...process.env,
      CI: process.env.CI ?? "true",
      SUPABASE_TELEMETRY_DISABLED: "1",
    },
    shell: false,
    stdio: capturesSensitiveOutput ? "pipe" : "inherit",
  });

  if (capturesSensitiveOutput) {
    if (result.stdout) process.stdout.write(redact(result.stdout.toString()));
    if (result.stderr) process.stderr.write(redact(result.stderr.toString()));
  }

  if (result.error) {
    fail(`${[command, ...args].join(" ")} could not start: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`${[command, ...args].join(" ")} failed with exit code ${result.status ?? "unknown"}.`);
  }
}
