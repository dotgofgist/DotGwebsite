import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "../fixtures.ts";
import { e2eAccounts } from "../helpers/accounts.ts";

const publicA11yRoutes = [
  "/",
  "/about",
  "/projects",
  "/projects/project-aurora",
  "/notices",
  "/notices/website-operation-guide",
  "/recruitment",
  "/contact",
  "/admin/login",
];

async function expectNoSeriousA11yViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const blockingViolations = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  expect(
    blockingViolations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    })),
  ).toEqual([]);
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`accessibility smoke (${colorScheme})`, () => {
    test.use({ colorScheme });

    for (const route of publicA11yRoutes) {
      test(`has no serious or critical violations on ${route}`, async ({ page }) => {
        await page.goto(route);
        await expectNoSeriousA11yViolations(page);
      });
    }

    test("keeps the primary link readable on hover and focus", async ({ page }) => {
      await page.goto("/");
      const primaryLink = page.getByRole("link", { name: "프로젝트 보기", exact: true });
      await primaryLink.hover();
      await expectNoSeriousA11yViolations(page);
      await page.mouse.move(0, 0);
      await primaryLink.focus();
      await expectNoSeriousA11yViolations(page);
    });

    test.describe("editor admin form", () => {
      test.use({ storageState: e2eAccounts.editor.storageState });

      test("has no serious or critical violations on project creation", async ({ page }) => {
        await page.goto("/admin/projects/new");
        await expectNoSeriousA11yViolations(page);
        await page.getByRole("button", { name: "프로젝트 생성", exact: true }).hover();
        await expectNoSeriousA11yViolations(page);
      });
    });
  });
}
