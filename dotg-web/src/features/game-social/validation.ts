const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const handle = /^[a-z0-9_]{3,24}$/;
const fields: Record<string, readonly string[]> = {
  save_profile: ["handle", "display_name", "bio", "avatar"],
  request_friend: ["handle"], block_user: ["handle"], unblock_user: ["user_id"],
  accept_friend: ["id"], remove_friend: ["id"],
  create_room: ["title", "endpoint"], close_room: ["session_id"],
  invite_friend: ["session_id", "user_id"], host_bundle: ["session_id"],
  accept_invite: ["id"], decline_invite: ["id"], join_bundle: ["id"],
};

export function validateSocialRequest(value: unknown): { action: string; payload: Record<string, string> } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("요청 형식을 확인해 주세요.");
  const { action, payload } = value as Record<string, unknown>;
  if (typeof action !== "string" || !Object.hasOwn(fields, action) || !payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("지원하지 않는 요청입니다.");
  }
  const result: Record<string, string> = {};
  for (const field of fields[action]) {
    const raw = (payload as Record<string, unknown>)[field];
    if (typeof raw !== "string") throw new Error("필수 값을 입력해 주세요.");
    result[field] = raw.trim();
    if ((field === "id" || field.endsWith("_id")) && !uuid.test(result[field])) throw new Error("대상을 확인해 주세요.");
  }
  if ("handle" in result) {
    result.handle = result.handle.toLowerCase();
    if (!handle.test(result.handle)) throw new Error("사용자 ID는 영문 소문자·숫자·밑줄 3~24자입니다.");
  }
  if (action === "save_profile") {
    if (!result.display_name || [...result.display_name].length > 32 || /[\p{Cc}]/u.test(result.display_name)) throw new Error("닉네임은 제어문자 없이 1~32자로 입력해 주세요.");
    if ([...result.bio].length > 240) throw new Error("소개는 240자 이내로 입력해 주세요.");
    if (!["coral", "mint", "blue", "violet"].includes(result.avatar)) throw new Error("프로필 색상을 선택해 주세요.");
  }
  if (action === "create_room") {
    if (!result.title || [...result.title].length > 60) throw new Error("방 이름은 1~60자로 입력해 주세요.");
    if (result.endpoint.startsWith("eos:")) {
      const room = /^eos:([0-9a-f]{32}):([0-9a-f]{32})$/i.exec(result.endpoint);
      if (!room || room[1] === "0".repeat(32) || room[2] === "0".repeat(32)) throw new Error("게임에서 F6으로 복사한 EOS 방 코드를 붙여 넣어 주세요.");
      result.endpoint = result.endpoint.toLowerCase();
      return { action, payload: result };
    }
    const endpoint = /^([a-zA-Z0-9.-]+|\[[0-9a-fA-F:]+\]):([0-9]{1,5})$/.exec(result.endpoint);
    if (!endpoint || result.endpoint.length > 260 || Number(endpoint[2]) < 1 || Number(endpoint[2]) > 65535) throw new Error("접속 주소와 포트를 확인해 주세요. 예: 192.168.0.10:28080");
    if (["0.0.0.0", "[::]"].includes(endpoint[1])) throw new Error("다른 PC가 접속할 수 있는 호스트 주소를 입력해 주세요.");
  }
  return { action, payload: result };
}

export function safePlayerReturnPath(value: string | null): string {
  return value === "/play/password" ? value : "/play";
}
