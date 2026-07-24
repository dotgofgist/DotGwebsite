import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, runFixture) => {
    const errors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await runFixture(page);

    expect(errors, `Unexpected browser errors:\n${errors.join("\n")}`).toEqual([]);
  },
});

export { expect };
