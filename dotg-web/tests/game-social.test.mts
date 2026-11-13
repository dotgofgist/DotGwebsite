import assert from "node:assert/strict";
import { test } from "node:test";
import { safePlayerReturnPath, validateSocialRequest } from "../src/features/game-social/validation.ts";
test("player cannot inject roles or identities through profile payloads", () => {
  const result = validateSocialRequest({ action: "save_profile", payload: { handle: "Friend_1", display_name: "친구", bio: "안녕", avatar: "mint", role: "admin", id: "attacker" } });
  assert.deepEqual(result.payload, { handle: "friend_1", display_name: "친구", bio: "안녕", avatar: "mint" });
});
test("mutations reject invalid targets, endpoints and inherited action names", () => {
  for (const input of [
    { action: "accept_friend", payload: { id: "fake" } },
    { action: "toString", payload: {} },
    { action: "create_room", payload: { title: "방", endpoint: "127.0.0.1:99999" } },
    { action: "create_room", payload: { title: "방", endpoint: "0.0.0.0:28080" } },
    { action: "create_room", payload: { title: "방", endpoint: "https://example.com" } },
  ]) assert.throws(() => validateSocialRequest(input));
});
test("valid IPv4 and IPv6 room addresses survive validation", () => {
  for (const endpoint of ["192.168.1.2:28080", "[::1]:28080"]) assert.equal(validateSocialRequest({ action: "create_room", payload: { title: "방", endpoint } }).payload.endpoint, endpoint);
});
test("email callbacks only return to player routes", () => {
  assert.equal(safePlayerReturnPath("/play/password"), "/play/password");
  for (const path of [null, "//evil.test", "https://evil.test", "/admin", "/play/../admin"]) assert.equal(safePlayerReturnPath(path), "/play");
});
