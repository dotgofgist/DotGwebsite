const defaultAdminPath = "/admin";
const blockedAdminPaths = new Set(["/admin/login", "/admin/unauthorized"]);
const maxNextPathLength = 2048;
const unsafeControlCharacters = /[\u0000-\u001f\u007f]/;

function decodeRepeatedly(value: string): string | null {
  let decoded = value;

  for (let index = 0; index < 2; index += 1) {
    try {
      const nextDecoded = decodeURIComponent(decoded);

      if (nextDecoded === decoded) {
        return decoded;
      }

      decoded = nextDecoded;
    } catch {
      return null;
    }
  }

  return decoded;
}

export function getSafeAdminReturnPath(
  value: FormDataEntryValue | string | null | undefined,
): string {
  if (typeof value !== "string") {
    return defaultAdminPath;
  }

  const trimmedValue = value.trim();
  const decodedValue = decodeRepeatedly(trimmedValue);

  if (
    !trimmedValue ||
    trimmedValue.length > maxNextPathLength ||
    !decodedValue ||
    decodedValue.length > maxNextPathLength ||
    unsafeControlCharacters.test(decodedValue) ||
    decodedValue.includes("\\") ||
    decodedValue.startsWith("//")
  ) {
    return defaultAdminPath;
  }

  try {
    const url = new URL(decodedValue, "http://dotg.local");

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
