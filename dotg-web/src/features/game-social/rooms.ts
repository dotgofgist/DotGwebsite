export type ListedRoom = {
  code: string; title: string; host_name: string; map_id: "fairy-kingdom-castle" | "elf-city";
  players: number; capacity: number; state: "waiting" | "playing" | "finished"; created_at: string;
};
const fields: Record<string, string[]> = {
  link_begin: [], link_status: ["token"], link_approve: ["code"],
  create: ["token", "title", "endpoint", "map_id"],
  heartbeat: ["token", "code", "map_id", "players", "state"], close: ["token", "code"], join: ["code"],
};
export function validateRoomRequest(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("요청 형식을 확인해 주세요.");
  const { action, payload } = input as Record<string, unknown>;
  if (typeof action !== "string" || !Object.hasOwn(fields, action) || !payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("지원하지 않는 요청입니다.");
  const value = payload as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const key of [...fields[action], ...(action === "join" && value.token !== undefined ? ["token"] : [])]) {
    if (typeof value[key] !== "string") throw new Error("필수 값을 입력해 주세요.");
    result[key] = value[key].trim();
  }
  if (result.token !== undefined && !/^[a-f0-9]{64}$/.test(result.token)) throw new Error("게임 계정을 다시 연결해 주세요.");
  if (result.code !== undefined) {
    result.code = result.code.replace(/[-\s]/g, "").toUpperCase();
    if (!/^[A-F0-9]{8}$/.test(result.code)) throw new Error("8자리 코드를 입력해 주세요.");
  }
  if (result.title !== undefined && (!result.title || [...result.title].length > 60 || /[\p{Cc}]/u.test(result.title))) throw new Error("방 이름은 1~60자로 입력해 주세요.");
  if (result.endpoint !== undefined) {
    if (result.endpoint.startsWith("eos:")) {
      const code = /^eos:([0-9a-f]{32}):([0-9a-f]{32})$/i.exec(result.endpoint);
      if (!code || code[1] === "0".repeat(32) || code[2] === "0".repeat(32)) throw new Error("EOS 방 코드를 확인해 주세요.");
      result.endpoint = result.endpoint.toLowerCase();
    } else {
    const match = /^([a-zA-Z0-9.-]+|\[[0-9a-fA-F:]+\]):([0-9]{1,5})$/.exec(result.endpoint);
    if (!match || result.endpoint.length > 260 || ["0.0.0.0", "[::]"].includes(match[1]) || +match[2] < 1 || +match[2] > 65535) throw new Error("접속 가능한 주소:포트를 입력해 주세요.");
    }
  }
  if (result.map_id !== undefined && !["fairy-kingdom-castle", "elf-city"].includes(result.map_id)) throw new Error("맵을 확인해 주세요.");
  if (result.players !== undefined && !/^([1-9]|1[0-2])$/.test(result.players)) throw new Error("인원을 확인해 주세요.");
  if (result.state !== undefined && !["waiting", "playing", "finished"].includes(result.state)) throw new Error("방 상태를 확인해 주세요.");
  return { action, payload: result };
}
