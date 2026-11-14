import { test, expect } from "@playwright/test";
import sharp from "sharp";
import { e2eAccounts, e2ePassword } from "../helpers/accounts";

test("native login, photo upload, refresh and logout work without browser cookies", async ({ request }) => {
  test.setTimeout(90000);
  const rejected = await request.post("/api/game/auth", { data: { action: "login", email: e2eAccounts.member.email, password: "incorrect-local-password" } });
  expect(rejected.status()).toBe(401);
  const browser = await request.post("/api/game/auth", { headers: { Origin: "https://untrusted.test" }, data: { action: "login" } });
  expect(browser.status()).toBe(403);
  const login = await request.post("/api/game/auth", { data: { action: "login", email: e2eAccounts.member.email, password: e2ePassword } });
  expect(login.status()).toBe(200);
  expect(login.headers()["set-cookie"]).toBeUndefined();
  expect(login.headers()["cache-control"]).toContain("no-store");
  let session = await login.json();
  const device = session.device_token;
  expect(device).toMatch(/^[a-f0-9]{64}$/);
  const dashboard = () => request.post("/api/game/account", { data: { action: "dashboard", payload: { token: device } } });
  try {
    const before = await dashboard(); expect(before.status()).toBe(200);
    const headers = { Authorization: `Bearer ${session.access_token}`, "X-Game-Token": device, "Content-Type": "image/png" };
    const bad = await request.post("/api/game/account/avatar", { headers, data: Buffer.from("<svg>not a PNG</svg>") });
    expect(bad.status()).toBe(400);
    const bytes = await sharp({ create: { width: 800, height: 600, channels: 3, background: "#33aa88" } }).png().toBuffer();
    const uploaded = await request.post("/api/game/account/avatar", { headers, data: bytes });
    expect(uploaded.status()).toBe(200);
    const uploadedBody = await uploaded.json();
    const after = await (await dashboard()).json();
    expect(after.profile.avatar_path).toBe(uploadedBody.avatar_path);
    expect(after.profile.avatar_url).toContain(uploadedBody.avatar_path);
    const publicImage = await request.get(after.profile.avatar_url);
    expect(publicImage.status()).toBe(200);
    const metadata = await sharp(await publicImage.body()).metadata();
    expect(metadata.format).toBe("webp"); expect(metadata.width).toBe(512); expect(metadata.exif).toBeUndefined();
    const refresh = await request.post("/api/game/auth", { data: { action: "refresh", refresh_token: session.refresh_token } });
    expect(refresh.status()).toBe(200); session = await refresh.json();
    const removed = await request.delete("/api/game/account/avatar", { headers: { Authorization: `Bearer ${session.access_token}`, "X-Game-Token": device } });
    expect(removed.status()).toBe(200);
    expect((await (await dashboard()).json()).profile.avatar_path).toBeNull();
    const unauthorized = await request.post("/api/game/account/avatar", { headers: { Authorization: `Bearer ${device}`, "X-Game-Token": device, "Content-Type": "image/png" }, data: bytes });
    expect(unauthorized.status()).toBe(401);
  } finally {
    const logout = await request.post("/api/game/auth", { data: { action: "logout", access_token: session.access_token, refresh_token: session.refresh_token, device_token: device } });
    expect(logout.status()).toBe(200);
  }
  expect((await dashboard()).status()).toBe(401);
  expect((await request.delete("/api/game/account/avatar", { headers: { Authorization: `Bearer ${session.access_token}`, "X-Game-Token": device } })).status()).toBe(401);
  expect((await request.post("/api/game/auth", { data: { action: "refresh", refresh_token: session.refresh_token } })).status()).toBe(401);
});
