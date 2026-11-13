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
  "/recruitment",
  "/notices",
  "/contact",
  "/downloads",
  "/play",
  "/signup",
  "/login",
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

for (const route of ["/account", "/friends"]) {
  const response = await fetch(new URL(route, url), { redirect: "manual" });
  await response.body?.cancel();
  const location = response.headers.get("location");
  const destination = location ? new URL(location, url) : null;
  if (response.status < 300 || response.status >= 400 || destination?.pathname !== "/login" || destination.searchParams.get("next") !== route) {
    fail(`${route} did not redirect an unauthenticated visitor to login with its return path.`);
  }
  console.log(`[DotG smoke] PASS ${route} (protected)`);
}

const social = await fetch(new URL("/api/game/social", url));
await social.body?.cancel();
if (social.status !== 401) fail(`/api/game/social returned ${social.status} instead of 401.`);
console.log("[DotG smoke] PASS /api/game/social (authentication required)");

const rooms = await fetch(new URL("/api/game/rooms", url));
if (!rooms.ok || !Array.isArray((await rooms.json()).rooms)) fail("/api/game/rooms did not return a public room list.");
console.log("[DotG smoke] PASS /api/game/rooms (public room list)");

console.log(`[DotG smoke] ${mode} smoke passed for ${url.origin}.`);
