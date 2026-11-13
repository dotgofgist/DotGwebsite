import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MAX_AVATAR_BYTES, PLAYER_AVATAR_BUCKET } from "@/features/game-social/avatar";
import { processPlayerAvatar } from "@/features/game-social/avatar-processing";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers });

async function changeAvatar(request: Request, remove: boolean) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "허용되지 않는 요청입니다." }, 403);
  if (!isSupabaseConfigured()) return reply({ error: "계정 서비스를 준비하고 있습니다." }, 503);
  try {
    const db = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return reply({ error: "다시 로그인해 주세요." }, 401);
    let path = "";
    if (!remove) {
      if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return reply({ error: "사진 파일을 선택해 주세요." }, 415);
      // Bound the actual stream as well as Content-Length (which can be omitted).
      const limit = MAX_AVATAR_BYTES + 64 * 1024;
      if (Number(request.headers.get("content-length")) > limit) return reply({ error: "사진은 2MB 이하여야 합니다." }, 413);
      const reader = request.body?.getReader();
      if (!reader) return reply({ error: "사진 파일을 선택해 주세요." }, 400);
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > limit) { await reader.cancel(); return reply({ error: "사진은 2MB 이하여야 합니다." }, 413); }
        chunks.push(value);
      }
      let image: Buffer;
      try {
        const form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
        const file = form.get("photo");
        if (!(file instanceof File)) return reply({ error: "사진 파일을 선택해 주세요." }, 400);
        image = await processPlayerAvatar(file);
      } catch (error) { return reply({ error: error instanceof Error ? error.message : "사진을 확인해 주세요." }, 400); }
      path = `${user.id}/${crypto.randomUUID()}.webp`;
      const { error } = await db.storage.from(PLAYER_AVATAR_BUCKET).upload(path, image, { contentType: "image/webp", upsert: false, cacheControl: "3600" });
      if (error) return reply({ error: "사진을 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
    }
    const { data, error } = await db.rpc("game_social", { action: "set_avatar", payload: { path } });
    if (error) {
      if (path) await db.storage.from(PLAYER_AVATAR_BUCKET).remove([path]);
      return reply({ error: error.code === "P0001" ? error.message : "사진을 저장하지 못했습니다." }, 400);
    }
    const previous = (data as { previous_path: string | null }).previous_path;
    // The RPC returns the old path under the mutation lock; never delete the current photo.
    let cleanupPending = false;
    if (previous) {
      const { error: cleanupError } = await db.storage.from(PLAYER_AVATAR_BUCKET).remove([previous]);
      cleanupPending = Boolean(cleanupError);
    }
    return reply({ ok: true, avatar_path: path || null, cleanup_pending: cleanupPending });
  } catch { return reply({ error: "사진을 변경하지 못했습니다. 연결을 확인하고 다시 시도해 주세요." }, 503); }
}

export async function POST(request: Request) { return changeAvatar(request, false); }
export async function DELETE(request: Request) { return changeAvatar(request, true); }
