import { spawn, spawnSync } from "node:child_process";

const pnpmBin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function readLocalPublicKey(): string {
  const configuredKey = [
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.E2E_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.E2E_SUPABASE_ANON_KEY,
  ].find((key) => key?.trim());
  if (configuredKey) return configuredKey;

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
    const status = JSON.parse(result.stdout) as {
      PUBLISHABLE_KEY?: string;
      ANON_KEY?: string;
    };
    return status.PUBLISHABLE_KEY || status.ANON_KEY || "";
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
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: readLocalPublicKey(),
  },
  shell: false,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exitCode = code ?? 1;
});
