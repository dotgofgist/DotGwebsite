import type { Browser, Page } from "@playwright/test";
import { test, expect } from "./fixtures.ts";
import { e2eAccounts, e2ePassword, type E2ERole } from "./helpers/accounts.ts";
import { setE2EAccountRole } from "./helpers/data.ts";
import { getE2EConfig } from "./helpers/env.ts";

async function loginAndSave(page: Page, role: E2ERole): Promise<void> {
  const account = e2eAccounts[role];
  await page.goto("/admin/login");
  await page.locator("#admin-email").fill(account.email);
  await page.locator("#admin-password").fill(e2ePassword);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/admin(?:\?|$)/);

  await page.context().storageState({ path: account.storageState });
}

async function loginInFreshContext(browser: Browser, role: E2ERole): Promise<void> {
  const context = await browser.newContext({ baseURL: getE2EConfig().baseURL });
  const page = await context.newPage();

  try {
    await loginAndSave(page, role);
  } finally {
    await context.close();
  }
}

test("prepare member, editor, and admin sessions", async ({ browser }) => {
  test.setTimeout(90_000);

  await setE2EAccountRole(e2eAccounts.member.email, "editor");
  await loginInFreshContext(browser, "member");
  await setE2EAccountRole(e2eAccounts.member.email, "member");
  await loginInFreshContext(browser, "editor");
  await loginInFreshContext(browser, "admin");
});
