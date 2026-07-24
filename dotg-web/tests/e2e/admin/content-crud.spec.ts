import { test, expect } from "../fixtures.ts";
import { e2eAccounts } from "../helpers/accounts.ts";
import { cleanupE2EContent, getNoticeBySlug, getProjectBySlug } from "../helpers/data.ts";

test.describe("editor content CRUD", () => {
  test.use({ storageState: e2eAccounts.editor.storageState });

  test.afterAll(async () => {
    await cleanupE2EContent();
  });

  test("creates a project and verifies the database row", async ({ page }) => {
    const slug = `e2e-project-${Date.now()}`;

    await page.goto("/admin/projects/new");
    await page.locator("#project-title").fill("E2E Project");
    await page.locator("#project-slug").fill(slug);
    await page.locator("#project-summary").fill("E2E project summary");
    await page.locator("#project-description").fill("E2E project description");
    await page.locator("#project-publication-status").selectOption("published");
    await page.locator("#project-tags").fill("E2E, Playwright, e2e");
    await page.locator("#project-members").fill("E2E Tester|QA");
    await page.locator("#project-links").fill("website|E2E Link|https://e2e.example/project");
    await page.getByRole("button", { name: "프로젝트 생성" }).click();

    await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]+\/edit\?created=1/, {
      timeout: 20_000,
    });
    const row = await getProjectBySlug(slug);
    expect(row.error).toBeNull();
    expect(row.data?.title).toBe("E2E Project");
    expect(row.data?.publication_status).toBe("published");

    await page.locator("#project-title").fill("E2E Project Updated");
    await page.getByRole("button", { name: "프로젝트 저장" }).click();
    await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]+\/edit\?saved=1/, {
      timeout: 20_000,
    });

    const updatedRow = await getProjectBySlug(slug);
    expect(updatedRow.error).toBeNull();
    expect(updatedRow.data?.title).toBe("E2E Project Updated");
  });

  test("creates a notice and verifies the database row", async ({ page }) => {
    const slug = `e2e-notice-${Date.now()}`;

    await page.goto("/admin/notices/new");
    await page.locator("#notice-title").fill("E2E Notice");
    await page.locator("#notice-slug").fill(slug);
    await page.locator("#notice-summary").fill("E2E notice summary");
    await page.locator("#notice-content").fill("E2E notice content");
    await page.locator("#notice-publication-status").selectOption("published");
    await page.getByRole("button", { name: "공지사항 생성" }).click();

    await expect(page).toHaveURL(/\/admin\/notices\/[0-9a-f-]+\/edit\?created=1/, {
      timeout: 20_000,
    });
    const row = await getNoticeBySlug(slug);
    expect(row.error).toBeNull();
    expect(row.data?.title).toBe("E2E Notice");
    expect(row.data?.publication_status).toBe("published");

    await page.locator("#notice-title").fill("E2E Notice Updated");
    await page.getByRole("button", { name: "공지사항 저장" }).click();
    await expect(page).toHaveURL(/\/admin\/notices\/[0-9a-f-]+\/edit\?saved=1/, {
      timeout: 20_000,
    });

    const updatedRow = await getNoticeBySlug(slug);
    expect(updatedRow.error).toBeNull();
    expect(updatedRow.data?.title).toBe("E2E Notice Updated");
  });
});
