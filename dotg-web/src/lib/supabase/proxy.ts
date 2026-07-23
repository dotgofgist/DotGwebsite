import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";
import { createAdminLoginPath } from "@/features/auth/redirects";

function isProtectedAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    (pathname.startsWith("/admin/") &&
      pathname !== "/admin/login" &&
      pathname !== "/admin/unauthorized")
  );
}

function redirectToLogin(request: NextRequest, reason?: string): NextResponse {
  const safeLoginPath = createAdminLoginPath(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  const safeLoginUrl = new URL(safeLoginPath, request.url);

  if (reason) {
    safeLoginUrl.searchParams.set("reason", reason);
  }

  return NextResponse.redirect(safeLoginUrl);
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const env = getSupabasePublicEnv();
  const protectedAdminPath = isProtectedAdminPath(request.nextUrl.pathname);

  if (!env) {
    if (protectedAdminPath) {
      return redirectToLogin(request, "not-configured");
    }

    return NextResponse.next({
      request,
    });
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();

  if (protectedAdminPath && (error || !data?.claims.sub)) {
    return redirectToLogin(request);
  }

  return response;
}
