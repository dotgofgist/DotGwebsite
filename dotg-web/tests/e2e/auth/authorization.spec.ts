import { test, expect } from "../fixtures.ts";
import { e2eAccounts, e2ePassword } from "../helpers/accounts.ts";

const adminRoutes = [
  "/admin",
  "/admin/projects",
  "/admin/notices",
  "/admin/recruitment",
  "/admin/settings",
];

test("anonymous admin access redirects to login with a safe next path", async ({ page }) => {
  for (const route of adminRoutes) {
    await page.goto(route);
    if (route === "/admin") {
      await expect(page).toHaveURL(/\/admin\/login(?:\?|$)/);
    } else {
      await expect(page).toHaveURL(new RegExp(`/admin/login\\?next=${encodeURIComponent(route)}`));
    }
    await expect(page.locator("#admin-email")).toBeVisible();
  }
});

test("unsafe login next values are sanitized", async ({ page }) => {
  await page.goto("/admin/login?next=https://evil.example");
  await page.locator("#admin-email").fill(e2eAccounts.editor.email);
  await page.locator("#admin-password").fill(e2ePassword);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin(?:\?|$)/);
});

test("logout blocks the next admin navigation", async ({ page }) => {
  await page.goto("/admin/login");
  await page.locator("#admin-email").fill(e2eAccounts.admin.email);
  await page.locator("#admin-password").fill(e2ePassword);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/admin(?:\?|$)/);

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login(?:\?|$)/);
});

test.describe("member session", () => {
  test.use({ storageState: e2eAccounts.member.storageState });

  test("is blocked from admin routes", async ({ page }) => {
    for (const route of adminRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin\/unauthorized/);
    }
  });
});

test.describe("editor session", () => {
  test.use({ storageState: e2eAccounts.editor.storageState });

  test("can access content admin routes", async ({ page }) => {
    for (const route of adminRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}(?:\\?|$)`));
      await expect(page.locator("main")).toBeVisible();
    }
  });
});

test.describe("admin session", () => {
  test.use({ storageState: e2eAccounts.admin.storageState });

  test("can access the dashboard", async ({ page }) => {
    for (const route of adminRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}(?:\\?|$)`));
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
