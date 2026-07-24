import { test, expect } from "../fixtures.ts";

const seoRoutes = [
  "/",
  "/about",
  "/projects",
  "/projects/project-aurora",
  "/notices",
  "/notices/website-operation-guide",
  "/recruitment",
  "/contact",
];

test.describe("SEO smoke", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  });

  for (const route of seoRoutes) {
    test(`has required head metadata on ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page).not.toHaveTitle("");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /https?:\/\/.+/);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    });
  }

  test("publishes robots and sitemap for public routes only", async ({ page, request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    const robotsText = await robots.text();
    expect(robotsText).toContain("Disallow: /admin/");
    expect(robotsText).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain("<loc>http://localhost:3000/projects</loc>");
    expect(sitemapText).toContain("<loc>http://localhost:3000/notices</loc>");
    expect(sitemapText).not.toContain("/admin");

    await page.goto("/admin/login");
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("publishes a web manifest and default Open Graph image", async ({ request }) => {
    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.ok()).toBe(true);
    expect(await manifest.json()).toMatchObject({
      short_name: "DotG",
      start_url: "/",
      display: "browser",
    });

    const ogImage = await request.get("/opengraph-image");
    expect(ogImage.ok()).toBe(true);
    expect(ogImage.headers()["content-type"]).toContain("image/png");
  });
});
