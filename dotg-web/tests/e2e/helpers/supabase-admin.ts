import { spawnSync } from "node:child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import { getE2EConfig, isLocalSupabaseURL } from "./env.ts";

type SupabaseStatus = {
  SERVICE_ROLE_KEY?: string;
};

let cachedClient: SupabaseClient<Database> | undefined;

function readLocalStatus(): SupabaseStatus {
  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "pnpm";
  const commandArgs =
    process.platform === "win32"
      ? ["/d", "/c", "pnpm.cmd supabase status"]
      : ["supabase", "status"];
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
    throw new Error(
      `Local Supabase is not running. Start it with pnpm supabase start. ${result.stderr}`,
    );
  }

  return JSON.parse(result.stdout) as SupabaseStatus;
}

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient;

  const config = getE2EConfig();
  if (!isLocalSupabaseURL(config.supabaseURL)) {
    throw new Error("E2E admin fixture setup is limited to local Supabase.");
  }

  const status = readLocalStatus();
  if (!status.SERVICE_ROLE_KEY) {
    throw new Error("Local Supabase status did not include a service role key.");
  }

  cachedClient = createClient<Database>(config.supabaseURL, status.SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
