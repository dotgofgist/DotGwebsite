export type NativeAuthRequest =
  | { action: "login"; email: string; password: string }
  | { action: "refresh"; refresh_token: string }
  | { action: "logout"; access_token: string; refresh_token: string; device_token: string };

export function validateNativeAuth(value: unknown): NativeAuthRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("요청을 확인해 주세요.");
  const input = value as Record<string, unknown>;
  if (input.action === "login") {
    const email = typeof input.email === "string" ? input.email.trim() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("이메일 주소를 확인해 주세요.");
    if (typeof input.password !== "string" || input.password.length < 1 || input.password.length > 128) throw new Error("비밀번호를 입력해 주세요.");
    // Passwords are not trimmed, normalized, logged or persisted.
    return { action: "login", email, password: input.password };
  }
  const token = (name: string, maximum: number) => {
    const value = input[name];
    if (typeof value !== "string" || !value.length || value.length > maximum || /\s/.test(value)) throw new Error("다시 로그인해 주세요.");
    return value;
  };
  if (input.action === "refresh") return { action: "refresh", refresh_token: token("refresh_token", 2048) };
  if (input.action === "logout") {
    const device = token("device_token", 64);
    if (!/^[a-f0-9]{64}$/.test(device)) throw new Error("다시 로그인해 주세요.");
    return { action: "logout", access_token: token("access_token", 8192), refresh_token: token("refresh_token", 2048), device_token: device };
  }
  throw new Error("지원하지 않는 요청입니다.");
}
