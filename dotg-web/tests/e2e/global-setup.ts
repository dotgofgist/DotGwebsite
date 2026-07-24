import { mkdirSync } from "node:fs";
import { cleanupE2EContent, ensureE2EAccounts } from "./helpers/data.ts";
import { getE2EConfig } from "./helpers/env.ts";

async function globalSetup() {
  getE2EConfig();
  mkdirSync("tests/e2e/.auth", { recursive: true });
  await ensureE2EAccounts();
  await cleanupE2EContent();
}

export default globalSetup;
