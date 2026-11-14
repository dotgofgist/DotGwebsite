import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AVATAR_MIME_TYPES, MAX_AVATAR_BYTES, PLAYER_AVATAR_BUCKET } from "@/features/game-social/avatar";
import { processPlayerAvatar } from "@/features/game-social/avatar-processing";
import { nativeClient, nativeReply as reply, nativeRequestAllowed, readNativeBody } from "@/features/game-social/native-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function change(request: Request, remove: boolean) {
  if (!nativeRequestAllowed(request)) return reply({ error: "게임에서 요청해 주세요." }, 403);
  const authorization = request.headers.get("authorization") ?? "";
  const device = request.headers.get("x-game-token") ?? "";
  if (!/^Bearer [^\s]{1,8192}$/.test(authorization) || !/^[a-f0-9]{64}$/.test(device)) return reply({ error: "다시 로그인해 주세요." }, 401);
  if (!isSupabaseConfigured()) return reply({ error: "계정 서비스를 준비하고 있습니다." }, 503);
  try {
    // This client uses the user's verified JWT, never a service-role key or device token.
    const db = nativeClient(authorization.slice(7));
    const { data: { user }, error: authError } = await db.auth.getUser(authorization.slice(7));
    if (authError || !user) return reply({ error: "로그인이 만료됐어요. 다시 로그인해 주세요." }, 401);
    const { data: matched, error: matchError } = await db.rpc("game_native_device_matches", { token: device });
    if (matchError) return reply({ error: "계정 연결을 확인하지 못했습니다." }, 503);
    if (!matched) return reply({ error: "게임 계정이 만료됐어요. 다시 로그인해 주세요." }, 401);
    let path = "";
    if (!remove) {
      const mime = request.headers.get("content-type") ?? "";
      if (!AVATAR_MIME_TYPES.includes(mime)) return reply({ error: "JPG, PNG, WebP 사진만 사용할 수 있습니다." }, 415);
      let image: Buffer;
      try {
        const bytes = await readNativeBody(request, MAX_AVATAR_BYTES);
        image = await processPlayerAvatar(new File([bytes as Uint8Array<ArrayBuffer>], "photo", { type: mime }));
      } catch (error) { return reply({ error: error instanceof Error ? error.message : "사진을 확인해 주세요." }, 400); }
      path = `${user.id}/${crypto.randomUUID()}.webp`;
      const { error } = await db.storage.from(PLAYER_AVATAR_BUCKET).upload(path, image, { contentType: "image/webp", upsert: false, cacheControl: "3600" });
      if (error) return reply({ error: "사진을 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
    }
    const { data, error } = await db.rpc("game_social", { action: "set_avatar", payload: { path } });
    if (error) {
      if (path) await db.storage.from(PLAYER_AVATAR_BUCKET).remove([path]);
      return reply({ error: "사진을 저장하지 못했습니다. 프로필을 먼저 저장해 주세요." }, 400);
    }
    const previous = (data as { previous_path: string | null }).previous_path;
    let cleanupPending = false;
    if (previous) {
      const { error } = await db.storage.from(PLAYER_AVATAR_BUCKET).remove([previous]);
      cleanupPending = Boolean(error);
    }
    return reply({ ok: true, avatar_path: path || null, cleanup_pending: cleanupPending });
  } catch { return reply({ error: "사진을 변경하지 못했습니다. 연결을 확인해 주세요." }, 503); }
}
export async function POST(request: Request) { return change(request, false); }
export async function DELETE(request: Request) { return change(request, true); }
