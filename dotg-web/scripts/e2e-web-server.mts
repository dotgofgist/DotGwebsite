import { spawn, spawnSync } from "node:child_process";

const pnpmBin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function readLocalAnonKey(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  if (process.env.E2E_SUPABASE_ANON_KEY) {
    return process.env.E2E_SUPABASE_ANON_KEY;
  }

  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : pnpmBin;
  const commandArgs =
    process.platform === "win32"
      ? ["/d", "/c", "pnpm.cmd supabase status --output json"]
      : ["supabase", "status", "--output", "json"];
  const result = spawnSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      SUPABASE_TELEMETRY_DISABLED: "1",
    },
    shell: false,
  });

  if (result.status !== 0) return "";

  try {
    const status = JSON.parse(result.stdout) as { ANON_KEY?: string };
    return status.ANON_KEY ?? "";
  } catch {
    return "";
  }
}

const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : pnpmBin;
const commandArgs = process.platform === "win32" ? ["/d", "/c", "pnpm.cmd dev"] : ["dev"];
const child = spawn(command, commandArgs, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readLocalAnonKey(),
  },
  shell: false,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exitCode = code ?? 1;
});
