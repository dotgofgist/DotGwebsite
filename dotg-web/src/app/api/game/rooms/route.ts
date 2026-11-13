import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { validateRoomRequest } from "@/features/game-social/rooms";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "Vary": "Cookie", "X-Content-Type-Options": "nosniff" };
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers });
async function execute(action: string, payload: Record<string, string>, browser: boolean) {
  if (!isSupabaseConfigured()) return reply({ error: "방 목록 서비스를 준비하고 있습니다." }, 503);
  try {
    const db = await createServerSupabaseClient();
    // Device requests must carry their scoped token. Never fall back to a cookie
    // when an untrusted native request omits its credential.
    if (action === "link_approve" || (action === "join" && !payload.token)) {
      if (!browser) return reply({ error: "웹 계정을 먼저 연결해 주세요." }, 401);
      const { data, error } = await db.auth.getUser();
      if (error || !data.user) return reply({ error: "먼저 로그인해 주세요." }, 401);
    }
    const { data, error } = await db.rpc("game_rooms", { action, payload });
    if (error) {
      if (error.code === "28000") return reply({ error: error.message }, 401);
      if (error.code === "P0001") return reply({ error: error.message }, 400);
      return reply({ error: "방 서비스를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." }, 503);
    }
    return reply(data);
  } catch { return reply({ error: "방 서비스에 연결할 수 없습니다." }, 503); }
}
export async function GET() { return execute("list", {}, false); }
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "허용되지 않는 요청입니다." }, 403);
  if (!origin && request.headers.has("cookie")) return reply({ error: "허용되지 않는 요청입니다." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "JSON 요청이 필요합니다." }, 415);
  const body = await request.text();
  if (new TextEncoder().encode(body).length > 4096) return reply({ error: "요청이 너무 큽니다." }, 413);
  try {
    const { action, payload } = validateRoomRequest(JSON.parse(body));
    return await execute(action, payload, origin !== null);
  } catch (error) { return reply({ error: error instanceof SyntaxError ? "JSON 요청을 확인해 주세요." : error instanceof Error ? error.message : "입력을 확인해 주세요." }, 400); }
}
