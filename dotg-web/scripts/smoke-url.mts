const mode = process.argv.includes("--production") ? "production" : "preview";
const baseURL =
  process.env.SMOKE_BASE_URL ??
  process.env.E2E_BASE_URL ??
  process.env.VERCEL_URL ??
  process.env.DEPLOYMENT_URL;
const publicRoutes = [
  "/",
  "/about",
  "/projects",
  "/projects/project-aurora",
  "/recruitment",
  "/notices",
  "/notices/website-operation-guide",
  "/contact",
  "/admin/login",
  "/robots.txt",
  "/sitemap.xml",
];

function fail(message: string): never {
  console.error(`[DotG smoke] ${message}`);
  process.exit(1);
}

if (!baseURL) {
  fail("Set SMOKE_BASE_URL to the deployed site URL.");
}

const normalizedBaseURL = baseURL.startsWith("http") ? baseURL : `https://${baseURL}`;
const url = new URL(normalizedBaseURL);

if (mode === "preview" && process.env.SMOKE_ALLOW_PRODUCTION !== "true") {
  const host = url.hostname.toLowerCase();
  if (!host.includes("vercel.app") && !host.includes("preview") && !host.includes("localhost")) {
    fail("Preview smoke refuses production-like hosts unless SMOKE_ALLOW_PRODUCTION=true.");
  }
}

for (const route of publicRoutes) {
  const target = new URL(route, url);
  const response = await fetch(target, {
    headers: { "user-agent": "DotG-CI-Smoke/1.0" },
    redirect: "follow",
  });

  if (!response.ok) {
    fail(`${target.toString()} returned HTTP ${response.status}.`);
  }

  const body = await response.text();
  const expectsHtmlMain = !route.endsWith(".txt") && !route.endsWith(".xml");
  if (expectsHtmlMain && !body.includes("<main") && !body.includes("</main>")) {
    fail(`${target.toString()} did not include a main landmark.`);
  }

  console.log(`[DotG smoke] PASS ${target.pathname} (${response.status})`);
}

console.log(`[DotG smoke] ${mode} smoke passed for ${url.origin}.`);
