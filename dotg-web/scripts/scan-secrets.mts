import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const forbiddenTrackedFiles = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.preview",
  "tests/e2e/.auth/member.json",
  "tests/e2e/.auth/editor.json",
  "tests/e2e/.auth/admin.json",
]);
const secretPatterns = [
  { name: "Supabase service role JWT", pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  { name: "Vercel token", pattern: /\bvercel_[A-Za-z0-9]{20,}\b/i },
  { name: "Supabase access token", pattern: /\bsbp_[A-Za-z0-9_-]{20,}\b/i },
  { name: "Database password assignment", pattern: /\b(?:DB_PASSWORD|POSTGRES_PASSWORD|SUPABASE_DB_PASSWORD)\s*=\s*['"]?[^'"\s]+/i },
  { name: "Authorization bearer token", pattern: /\bAuthorization:\s*Bearer\s+[A-Za-z0-9._-]+/i },
];

function git(args: string[]): string {
  const executable = process.platform === "win32" ? "git.exe" : "git";
  const result = spawnSync(executable, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return result.stdout;
}

const trackedFiles = git(["ls-files"])
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
const failures: string[] = [];

for (const file of trackedFiles) {
  if (forbiddenTrackedFiles.has(file)) {
    failures.push(`Forbidden tracked file: ${file}`);
    continue;
  }

  if (!/\.(?:env|json|ya?ml|ts|tsx|mts|js|mjs|sql|md|txt)$/i.test(file)) continue;

  const content = readFileSync(file, "utf8");

  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(content)) {
      failures.push(`${name} pattern found in ${file}`);
    }
  }
}

if (failures.length > 0) {
  console.error("[DotG secrets] Possible secret leak detected.");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[DotG secrets] No tracked secret patterns detected.");
