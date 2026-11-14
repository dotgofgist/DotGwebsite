import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/database.types.ts";
import { requireSupabasePublicEnv } from "../../lib/supabase/env.ts";

export const nativeHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
export const nativeReply = (value: unknown, status = 200) => Response.json(value, { status, headers: nativeHeaders });
export function nativeRequestAllowed(request: Request) {
  return !request.headers.has("origin") && !request.headers.has("cookie");
}
export function nativeClient(accessToken?: string) {
  const { url, publicKey } = requireSupabasePublicEnv();
  return createClient<Database>(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });
}
export async function readNativeBody(request: Request, limit: number): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > limit) throw new Error("요청이 너무 큽니다.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new Error("요청이 너무 큽니다."); }
    chunks.push(value);
  }
  return new Uint8Array(Buffer.concat(chunks));
}
