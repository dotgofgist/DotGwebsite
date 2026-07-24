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
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test.describe("accessibility smoke", () => {
  for (const route of publicA11yRoutes) {
    test(`has no serious or critical violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expectNoSeriousA11yViolations(page);
    });
  }

  test.describe("editor admin form", () => {
    test.use({ storageState: e2eAccounts.editor.storageState });

    test("has no serious or critical violations on project creation", async ({ page }) => {
      await page.goto("/admin/projects/new");
      await expectNoSeriousA11yViolations(page);
    });
  });
});
