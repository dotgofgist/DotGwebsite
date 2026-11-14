import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PLAYER_AVATAR_BUCKET } from "@/features/game-social/avatar";
import { validateNativeRequest } from "@/features/game-social/native";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
const reply = (value: unknown, status = 200) => NextResponse.json(value, { status, headers });

export async function POST(request: Request) {
  // This endpoint has no browser credentials or CORS; the device token is mandatory.
  if (request.headers.has("cookie") || request.headers.has("origin")) return reply({ error: "게임에서 요청해 주세요." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "JSON 요청이 필요합니다." }, 415);
  let input;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).length > 4096) return reply({ error: "요청이 너무 큽니다." }, 413);
    input = validateNativeRequest(JSON.parse(body));
  } catch (error) { return reply({ error: error instanceof SyntaxError ? "JSON 요청을 확인해 주세요." : error instanceof Error ? error.message : "입력을 확인해 주세요." }, 400); }
  if (!isSupabaseConfigured()) return reply({ error: "계정 서비스를 준비하고 있습니다." }, 503);
  try {
    const db = await createServerSupabaseClient();
    const { data, error } = await db.rpc("game_native_social", input);
    if (error) {
      if (error.code === "28000") return reply({ error: "로그인이 만료됐어요. 다시 로그인해 주세요." }, 401);
      if (error.code === "23505") return reply({ error: "이미 사용 중인 사용자 ID입니다." }, 409);
      if (error.code === "P0001") return reply({ error: error.message }, 400);
      if (["23514", "23502", "22P02"].includes(error.code)) return reply({ error: "입력 값을 확인해 주세요." }, 400);
      return reply({ error: "계정 서비스를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." }, 503);
    }
    if (input.action === "dashboard" && data && typeof data === "object" && !Array.isArray(data)) {
      const profile = data.profile;
      if (profile && typeof profile === "object" && !Array.isArray(profile)) {
        profile.avatar_url = typeof profile.avatar_path === "string" ? db.storage.from(PLAYER_AVATAR_BUCKET).getPublicUrl(profile.avatar_path).data.publicUrl : null;
      }
    }
    return reply(data);
  } catch { return reply({ error: "계정 서비스에 연결하지 못했어요. 다시 시도해 주세요." }, 503); }
}
