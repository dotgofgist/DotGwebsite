import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PLAYER_AVATAR_BUCKET } from "@/features/game-social/avatar";
import { nativeClient, nativeReply as reply, nativeRequestAllowed, readNativeBody } from "@/features/game-social/native-http";
import { validateNativeAuth } from "@/features/game-social/native-auth";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!nativeRequestAllowed(request)) return reply({ error: "게임에서 요청해 주세요." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "JSON 요청이 필요합니다." }, 415);
  let input;
  try { input = validateNativeAuth(JSON.parse(new TextDecoder().decode(await readNativeBody(request, 16384)))); }
  catch { return reply({ error: "이메일·비밀번호 또는 요청 형식을 확인해 주세요." }, 400); }
  if (!isSupabaseConfigured()) return reply({ error: "계정 서비스를 준비하고 있습니다." }, 503);
  try {
    const db = nativeClient();
    if (input.action === "logout") {
      const { error } = await db.rpc("game_native_logout", { token: input.device_token });
      if (error) return reply({ error: "로그아웃 연결을 확인해 주세요." }, 503);
      const session = await db.auth.setSession({ access_token: input.access_token, refresh_token: input.refresh_token });
      if (!session.error) await db.auth.signOut({ scope: "local" });
      return reply({ ok: true });
    }
    const { data, error } = input.action === "login"
      ? await db.auth.signInWithPassword({ email: input.email, password: input.password })
      : await db.auth.refreshSession({ refresh_token: input.refresh_token });
    if (error || !data.session) return reply({ error: error?.status === 429 ? "시도가 많습니다. 잠시 후 다시 로그인해 주세요." : "이메일·비밀번호와 이메일 인증 여부를 확인해 주세요." }, error?.status === 429 ? 429 : 401);
    const { data: assurance, error: assuranceError } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError || (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2")) {
      await db.auth.signOut({ scope: "local" });
      return reply({ error: "이 계정은 2단계 인증이 필요합니다. 현재 게임 로그인에서는 지원하지 않습니다." }, 403);
    }
    const session = { access_token: data.session.access_token, refresh_token: data.session.refresh_token, expires_in: data.session.expires_in };
    if (input.action === "refresh") return reply(session);
    const { data: linked, error: linkError } = await db.rpc("game_native_login");
    if (linkError || !linked || typeof linked !== "object" || Array.isArray(linked)) {
      await db.auth.signOut({ scope: "local" });
      return reply({ error: "게임 계정을 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
    }
    const profile = linked.profile;
    if (profile && typeof profile === "object" && !Array.isArray(profile)) {
      profile.avatar_url = typeof profile.avatar_path === "string" ? db.storage.from(PLAYER_AVATAR_BUCKET).getPublicUrl(profile.avatar_path).data.publicUrl : null;
    }
    return reply({ ...session, ...linked });
  } catch { return reply({ error: "로그인 서비스에 연결하지 못했습니다. 다시 시도해 주세요." }, 503); }
}
