const defaultAdminPath = "/admin";
const blockedAdminPaths = new Set(["/admin/login", "/admin/unauthorized"]);

export function getSafeAdminReturnPath(
  value: FormDataEntryValue | string | null | undefined,
): string {
  if (typeof value !== "string") {
    return defaultAdminPath;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.startsWith("//")) {
    return defaultAdminPath;
  }

  try {
    const url = new URL(trimmedValue, "http://dotg.local");

    if (url.origin !== "http://dotg.local") {
      return defaultAdminPath;
    }

    const path = `${url.pathname}${url.search}${url.hash}`;

    if (
      !url.pathname.startsWith("/admin") ||
      blockedAdminPaths.has(url.pathname)
    ) {
      return defaultAdminPath;
    }

    return path;
  } catch {
    return defaultAdminPath;
  }
}

export function createAdminLoginPath(nextPath?: string): string {
  const safeNextPath = getSafeAdminReturnPath(nextPath);
  const params = new URLSearchParams();

  if (safeNextPath !== defaultAdminPath) {
    params.set("next", safeNextPath);
  }

  const query = params.toString();

  return query ? `/admin/login?${query}` : "/admin/login";
}
