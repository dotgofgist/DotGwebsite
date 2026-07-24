import { getE2EConfig, isLocalSupabaseURL } from "./env.ts";

const config = getE2EConfig();

if (!config.baseURL.startsWith("http://") && !config.baseURL.startsWith("https://")) {
  throw new Error("E2E_BASE_URL must be an absolute URL.");
}

if (config.targetEnv === "local" && !isLocalSupabaseURL(config.supabaseURL)) {
  throw new Error("Local E2E requires a local Supabase URL.");
}

console.log("[DotG E2E] preflight passed", {
  baseURL: config.baseURL,
  supabaseHost: new URL(config.supabaseURL).host,
  targetEnv: config.targetEnv,
  allowRemote: config.allowRemote,
});
