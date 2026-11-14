import { validateSocialRequest } from "./validation.ts";

const actions = new Set(["dashboard", "save_profile", "search_players", "request_friend", "accept_friend", "remove_friend", "block_user", "unblock_user", "invite_friend", "decline_invite", "join_invite"]);

export function validateNativeRequest(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("요청 형식을 확인해 주세요.");
  const { action, payload } = input as Record<string, unknown>;
  if (typeof action !== "string" || !actions.has(action) || !payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("지원하지 않는 요청입니다.");
  const token = (payload as Record<string, unknown>).token;
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw new Error("게임 계정을 다시 연결해 주세요.");
  const validated = action === "dashboard" ? {} : validateSocialRequest({ action: action === "join_invite" ? "accept_invite" : action, payload }).payload;
  return { action, payload: { ...validated, token } };
}
