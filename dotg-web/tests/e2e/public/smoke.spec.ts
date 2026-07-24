import { test, expect } from "../fixtures.ts";

const publicRoutes = [
  "/",
  "/about",
  "/projects",
  "/projects/project-aurora",
  "/recruitment",
  "/notices",
  "/notices/website-operation-guide",
  "/contact",
];

test.describe("public pages", () => {
  for (const route of publicRoutes) {
    test(`loads ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok(), `${route} should return a successful response`).toBe(true);
      await expect(page.locator("main")).toBeVisible();
      await expect(page).not.toHaveTitle("");
    });
  }

  test("unknown public content returns not found", async ({ page }) => {
    await page.goto("/projects/not-a-real-project");
    await expect(
      page.getByRole("heading", { name: "프로젝트를 찾을 수 없습니다" }),
    ).toBeVisible();
  });
});
