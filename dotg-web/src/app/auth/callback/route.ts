import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safePlayerReturnPath } from "@/features/game-social/validation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const db = await createServerSupabaseClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  let succeeded = false;
  if (code) succeeded = !(await db.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && (type === "signup" || type === "recovery" || type === "email")) {
    succeeded = !(await db.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }
  const path = succeeded ? safePlayerReturnPath(type === "recovery" ? "/play/password" : url.searchParams.get("next")) : "/play?auth_error=1";
  const response = NextResponse.redirect(new URL(path, url.origin));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
