const localSiteUrl = "http://localhost:3000";

function readEnvValue(name: string): string | null {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function normalizeSiteUrl(value: string | null): string {
  if (!value) return localSiteUrl;

  try {
    const url = new URL(value);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return localSiteUrl;
  }
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(
    readEnvValue("NEXT_PUBLIC_SITE_URL") ??
      (readEnvValue("VERCEL_PROJECT_PRODUCTION_URL")
        ? `https://${readEnvValue("VERCEL_PROJECT_PRODUCTION_URL")}`
        : null),
  );
}

export function getSiteMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function getCanonicalUrl(path = "/"): string {
  return new URL(path, getSiteMetadataBase()).toString();
}
