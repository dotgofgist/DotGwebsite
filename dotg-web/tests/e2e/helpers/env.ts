export type E2EConfig = {
  baseURL: string;
  supabaseURL: string;
  supabaseAnonKey?: string;
  allowRemote: boolean;
  targetEnv: "local" | "preview" | "production";
  useWebServer: boolean;
};

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function parseTargetEnv(): E2EConfig["targetEnv"] {
  const value = read("E2E_TARGET_ENV") ?? "local";
  if (value === "local" || value === "preview" || value === "production") return value;
  throw new Error(`Invalid E2E_TARGET_ENV: ${value}`);
}

export function getE2EConfig(): E2EConfig {
  const baseURL = read("E2E_BASE_URL") ?? "http://localhost:3000";
  const supabaseURL =
    read("E2E_SUPABASE_URL") ??
    read("NEXT_PUBLIC_SUPABASE_URL") ??
    "http://127.0.0.1:54321";
  const allowRemote = read("E2E_ALLOW_REMOTE") === "true";
  const targetEnv = parseTargetEnv();
  const parsedSupabase = new URL(supabaseURL);
  const isLocalSupabase = localHosts.has(parsedSupabase.hostname);

  if (targetEnv === "production") {
    throw new Error("E2E tests are blocked against production Supabase.");
  }

  if (!isLocalSupabase && !allowRemote) {
    throw new Error("Remote E2E Supabase targets require E2E_ALLOW_REMOTE=true.");
  }

  return {
    baseURL,
    supabaseURL,
    supabaseAnonKey:
      read("E2E_SUPABASE_ANON_KEY") ?? read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    allowRemote,
    targetEnv,
    useWebServer: read("E2E_SKIP_WEBSERVER") !== "true",
  };
}

export function isLocalSupabaseURL(value: string): boolean {
  return localHosts.has(new URL(value).hostname);
}
