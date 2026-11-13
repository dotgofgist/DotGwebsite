import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { validateSocialRequest } from "@/features/game-social/validation";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "Vary": "Cookie", "X-Content-Type-Options": "nosniff" };
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers });

async function execute(action: string, payload: Record<string, string>) {
  if (!isSupabaseConfigured()) return reply({ error: "계정 서비스가 아직 설정되지 않았습니다." }, 503);
  const db = await createServerSupabaseClient();
  const { data: identity, error: authError } = await db.auth.getUser();
  if (authError || !identity.user) return reply({ error: "다시 로그인해 주세요." }, 401);
  const { data, error } = await db.rpc("game_social", { action, payload });
  if (error) {
    if (error.code === "23505") return reply({ error: "이미 사용 중인 사용자 ID입니다." }, 409);
    if (error.code === "P0001") return reply({ error: error.message }, 400);
    if (["23514", "23502", "22P02"].includes(error.code)) return reply({ error: "입력 값을 확인해 주세요." }, 400);
    return reply({ error: "게임 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
  }
  return reply(data);
}

async function safelyExecute(action: string, payload: Record<string, string>) {
  try { return await execute(action, payload); }
  catch { return reply({ error: "게임 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503); }
}

export async function GET() { return safelyExecute("dashboard", {}); }

export async function POST(request: Request) {
  // Cookie-authenticated mutations are same-origin only; no wildcard CORS.
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "허용되지 않는 요청입니다." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "JSON 요청이 필요합니다." }, 415);
  const body = await request.text();
  if (new TextEncoder().encode(body).length > 4096) return reply({ error: "요청이 너무 큽니다." }, 413);
  try {
    const { action, payload } = validateSocialRequest(JSON.parse(body));
    return await safelyExecute(action, payload);
  } catch (error) {
    return reply({ error: error instanceof SyntaxError ? "올바른 JSON 요청이 필요합니다." : error instanceof Error ? error.message : "요청을 확인해 주세요." }, 400);
  }
}
