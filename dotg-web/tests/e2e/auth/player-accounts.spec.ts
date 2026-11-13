import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures.ts";
import { e2eAccounts, e2ePassword } from "../helpers/accounts.ts";
import { getSupabaseAdminClient } from "../helpers/supabase-admin.ts";

test("signup separates name and nickname and retains values after password mismatch", async ({ page }) => {
  await page.goto("/signup");
  await page.locator('input[name="real_name"]').fill("테스트 이름");
  await page.locator('input[name="display_name"]').fill("테스트 닉네임");
  await page.locator('input[name="handle"]').fill("e2e_signup");
  await page.getByLabel("이메일", { exact: true }).fill("signup@example.test");
  await page.getByLabel("비밀번호", { exact: true }).fill("mismatch-one-123");
  await page.locator('input[name="password_confirm"]').fill("mismatch-two-123");
  await page.getByRole("button", { name: "가입하기", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("비밀번호가 서로 일치하지 않습니다.");
  await expect(page.locator('input[name="real_name"]')).toHaveValue("테스트 이름");
  await expect(page.locator('input[name="display_name"]')).toHaveValue("테스트 닉네임");
});

test("signup creates a profile with a private name and a separate nickname", async ({ page }) => {
  const handle = `e2e_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const email = `${handle}@example.test`;
  const admin = getSupabaseAdminClient();
  try {
    await page.goto("/signup");
    await page.locator('input[name="real_name"]').fill("가입 테스트 이름");
    await page.locator('input[name="display_name"]').fill("가입 테스트 닉네임");
    await page.locator('input[name="handle"]').fill(handle);
    await page.getByLabel("이메일", { exact: true }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(e2ePassword);
    await page.locator('input[name="password_confirm"]').fill(e2ePassword);
    await page.getByRole("button", { name: "가입하기", exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator('input[name="real_name"]')).toHaveValue("가입 테스트 이름");
    await expect(page.locator('input[name="display_name"]')).toHaveValue("가입 테스트 닉네임");
    await expect(page.locator('input[name="handle"]')).toHaveValue(handle);
    await page.getByRole("navigation", { name: "계정 메뉴" }).getByRole("button", { name: "로그아웃", exact: true }).click();
    await page.goto("/login");
    await page.getByLabel("이메일", { exact: true }).fill(email);
    await page.getByLabel("비밀번호", { exact: true }).fill(e2ePassword);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator('input[name="display_name"]')).toHaveValue("가입 테스트 닉네임");
  } finally {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find(candidate => candidate.email === email);
    if (user) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;
    }
  }
});

test("player login returns to the requested page and logout protects it again", async ({ page }) => {
  await page.goto("/friends");
  await expect(page).toHaveURL(/\/login\?next=\/?(?:friends|%2Ffriends)/);
  await page.getByLabel("이메일", { exact: true }).fill(e2eAccounts.member.email);
  await page.getByLabel("비밀번호", { exact: true }).fill(e2ePassword);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page).toHaveURL(/\/friends$/);
  await page.getByRole("navigation", { name: "계정 메뉴" }).getByRole("button", { name: "로그아웃", exact: true }).click();
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=/);
});

test.describe("player profile and friends", () => {
  test.use({ storageState: e2eAccounts.member.storageState });

  test("profile, photo and a consented friendship persist across page reloads", async ({ page, browser }) => {
    test.setTimeout(90_000);
    const otherContext = await browser.newContext({ storageState: e2eAccounts.editor.storageState, baseURL: test.info().project.use.baseURL });
    const other = await otherContext.newPage();
    try {
      for (const [target, handle, name, nickname] of [[page,"e2e_member","회원 테스트 이름","회원 테스트 닉네임"],[other,"e2e_editor","친구 테스트 이름","친구 테스트 닉네임"]] as const) {
        await target.goto("/account");
        await target.locator('input[name="real_name"]').fill(name);
        await target.locator('input[name="display_name"]').fill(nickname);
        await target.locator('input[name="handle"]').fill(handle);
        await target.getByRole("button", { name: "프로필 저장", exact: true }).click();
        await expect(target.getByRole("status")).toContainText("프로필을 저장했습니다.");
      }
      await page.reload();
      await expect(page.locator('input[name="real_name"]')).toHaveValue("회원 테스트 이름");
      await expect(page.locator('input[name="display_name"]')).toHaveValue("회원 테스트 닉네임");
      const buffer = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#89ddcc" } }).png().toBuffer();
      await page.locator('input[type="file"]').setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer });
      await page.getByRole("button", { name: "사진 저장", exact: true }).click();
      await expect(page.getByRole("status")).toContainText("프로필 사진을 변경했습니다.");
      await page.reload();
      await expect(page.getByAltText("회원 테스트 닉네임 프로필 사진")).toBeVisible();
      await page.getByRole("button", { name: "기본 사진으로 변경", exact: true }).click();
      await expect(page.getByRole("status")).toContainText("기본 프로필 사진으로 변경했습니다.");

      await page.goto("/friends");
      await page.getByLabel("친구 검색", { exact: true }).fill("e2e_editor");
      await page.getByRole("button", { name: "검색", exact: true }).click();
      await page.getByRole("button", { name: "친구 추가", exact: true }).click();
      await expect(page.getByRole("status").first()).toContainText("친구 요청을 보냈습니다.");
      await other.goto("/friends");
      await other.getByRole("button", { name: "수락", exact: true }).click();
      await expect(other.getByRole("status").first()).toContainText("친구 요청을 수락했습니다.");
      await page.reload();
      const friendList = page.locator("section").filter({ has: page.getByRole("heading", { name: /^내 친구/ }) });
      await expect(friendList).toContainText("친구 테스트 닉네임");
      await expect(friendList).not.toContainText("친구 테스트 이름");
      await friendList.getByRole("button", { name: "친구 삭제", exact: true }).click();
      await expect(friendList).toContainText("아직 친구가 없어요.");
    } finally { await otherContext.close(); }
  });
});
