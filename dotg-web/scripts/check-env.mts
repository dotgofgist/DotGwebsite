import nextEnv from "@next/env";
import { fileURLToPath } from "node:url";
import {
  assertSupabaseEnvForCurrentRuntime,
  createSupabaseEnvErrorMessage,
  getRuntimeEnvironment,
  getSupabaseEnvState,
} from "../src/lib/supabase/env.ts";

function setEnv(name: string, value: string): void {
  process.env[name] = value;
}

if (process.argv.includes("--production")) {
  setEnv("NODE_ENV", "production");
  setEnv("VERCEL_ENV", "production");
}

// Standalone Node scripts do not get Next.js's automatic .env file loading.
const projectDir = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(projectDir, process.env.NODE_ENV !== "production");

const runtime = getRuntimeEnvironment();
const state = getSupabaseEnvState();

try {
  assertSupabaseEnvForCurrentRuntime();
  console.log(
    `[DotG env] ${runtime}: Supabase public environment is ${state.configured ? "configured" : "not configured"}.`,
  );

  if (!state.configured) {
    console.log("[DotG env] Local public mock/config fallback is allowed.");
  }
} catch (error) {
  const message =
    error instanceof Error ? error.message : createSupabaseEnvErrorMessage();

  console.error(`[DotG env] ${runtime}: ${message}`);
  process.exitCode = 1;
}
