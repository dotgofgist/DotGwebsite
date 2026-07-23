export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

const missingEnvMessage =
  "Supabase 환경 변수가 설정되지 않았습니다. .env.example을 참고하여 .env.local을 구성하세요.";

function readEnvValue(name: string): string | null {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = readEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = readEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !publishableKey || !isValidUrl(url)) {
    return null;
  }

  return {
    url,
    publishableKey,
  };
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(missingEnvMessage);
  }

  return env;
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}
