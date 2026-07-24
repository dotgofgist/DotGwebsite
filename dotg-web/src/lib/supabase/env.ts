export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type AppRuntimeEnvironment = "local" | "preview" | "production";

export type SupabaseEnvIssue =
  | "missing-url"
  | "missing-anon-key"
  | "invalid-url"
  | "insecure-url";

export type SupabaseEnvState =
  | {
      configured: true;
      env: SupabasePublicEnv;
      issues: [];
    }
  | {
      configured: false;
      env: null;
      issues: SupabaseEnvIssue[];
    };

const envHelpMessage =
  "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.example and docs/environment-configuration.md.";

const warnedFallbackScopes = new Set<string>();

function readEnvValue(name: string): string | null {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isLocalSupabaseUrl(url: URL): boolean {
  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1"
  );
}

function isHttpsRequiredForSupabaseUrl(url: URL): boolean {
  return url.protocol !== "https:" && !isLocalSupabaseUrl(url);
}

export function getRuntimeEnvironment(): AppRuntimeEnvironment {
  const vercelEnv = readEnvValue("VERCEL_ENV");
  const publicVercelEnv = readEnvValue("NEXT_PUBLIC_VERCEL_ENV");

  if (vercelEnv === "production" || publicVercelEnv === "production") {
    return "production";
  }

  if (vercelEnv === "preview" || publicVercelEnv === "preview") {
    return "preview";
  }

  if (readEnvValue("VERCEL") === "1") {
    return "preview";
  }

  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  return "local";
}

export function isVercelRuntime(): boolean {
  return readEnvValue("VERCEL") === "1" || readEnvValue("VERCEL_ENV") !== null;
}

export function isLocalRuntime(): boolean {
  return getRuntimeEnvironment() === "local";
}

export function isPreviewRuntime(): boolean {
  return getRuntimeEnvironment() === "preview";
}

export function isProductionRuntime(): boolean {
  return getRuntimeEnvironment() === "production";
}

export function getSupabaseEnvState(): SupabaseEnvState {
  const url = readEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const issues: SupabaseEnvIssue[] = [];

  if (!url) {
    issues.push("missing-url");
  }

  if (!anonKey) {
    issues.push("missing-anon-key");
  }

  if (url) {
    const parsedUrl = parseUrl(url);

    if (!parsedUrl) {
      issues.push("invalid-url");
    } else if (isHttpsRequiredForSupabaseUrl(parsedUrl)) {
      issues.push("insecure-url");
    }
  }

  if (issues.length > 0 || !url || !anonKey) {
    return {
      configured: false,
      env: null,
      issues,
    };
  }

  return {
    configured: true,
    env: {
      url,
      anonKey,
    },
    issues: [],
  };
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const state = getSupabaseEnvState();

  return state.configured ? state.env : null;
}

function formatSupabaseEnvIssues(issues: SupabaseEnvIssue[]): string {
  const labels: Record<SupabaseEnvIssue, string> = {
    "missing-url": "NEXT_PUBLIC_SUPABASE_URL is missing",
    "missing-anon-key": "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing",
    "invalid-url": "NEXT_PUBLIC_SUPABASE_URL is not a valid URL",
    "insecure-url":
      "NEXT_PUBLIC_SUPABASE_URL must use HTTPS unless it points to local Supabase",
  };

  return issues.map((issue) => labels[issue]).join("; ");
}

export function createSupabaseEnvErrorMessage(
  context = "Supabase environment configuration",
): string {
  const state = getSupabaseEnvState();

  if (state.configured) {
    return `${context} is valid.`;
  }

  return `${context} is invalid: ${formatSupabaseEnvIssues(state.issues)}. ${envHelpMessage}`;
}

export function mustRequireSupabaseEnv(): boolean {
  return getRuntimeEnvironment() !== "local";
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const state = getSupabaseEnvState();

  if (!state.configured) {
    throw new Error(createSupabaseEnvErrorMessage());
  }

  return state.env;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnvState().configured;
}

export function canUsePublicMockFallback(): boolean {
  return getRuntimeEnvironment() === "local" && !isSupabaseConfigured();
}

export function warnPublicMockFallback(scope: string): void {
  if (!canUsePublicMockFallback() || warnedFallbackScopes.has(scope)) {
    return;
  }

  warnedFallbackScopes.add(scope);
  const state = getSupabaseEnvState();
  const issueText = formatSupabaseEnvIssues(state.configured ? [] : state.issues);

  console.warn(
    `[DotG env] ${scope} is using local mock/config fallback because Supabase is not fully configured. ${issueText}.`,
  );
}

export function shouldUsePublicMockFallback(scope: string): boolean {
  if (canUsePublicMockFallback()) {
    warnPublicMockFallback(scope);
    return true;
  }

  if (!isSupabaseConfigured()) {
    throw new Error(createSupabaseEnvErrorMessage(`${scope} Supabase access`));
  }

  return false;
}

export function assertSupabaseEnvForCurrentRuntime(): void {
  if (mustRequireSupabaseEnv()) {
    requireSupabasePublicEnv();
  }
}
