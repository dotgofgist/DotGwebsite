import { rm } from "node:fs/promises";
import { cleanupE2EContent } from "./helpers/data.ts";

export default async function globalTeardown(): Promise<void> {
  await cleanupE2EContent();
  await rm("tests/e2e/.auth", { recursive: true, force: true });
}
