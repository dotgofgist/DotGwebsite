import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = "supabase/migrations";
const requiredMigrations = [
  "20260723073310_create_initial_content_schema.sql",
  "20260723073320_add_initial_rls_policies.sql",
  "20260723090000_add_recruitment_write_functions.sql",
  "20260724090000_add_public_image_storage.sql",
];
const requiredTables = [
  "profiles",
  "projects",
  "project_members",
  "project_links",
  "notices",
  "recruitments",
  "recruitment_steps",
  "site_settings",
  "contact_items",
  "social_links",
];
const requiredEnums = [
  "content_status",
  "project_status",
  "project_link_type",
  "recruitment_status",
  "user_role",
];

function pass(message: string): void {
  console.log(`PASS ${message}`);
}

function fail(message: string): never {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

function readMigration(name: string): string {
  return readFileSync(join(migrationsDir, name), "utf8");
}

function includesAll(source: string, values: string[], label: string): void {
  const missing = values.filter((value) => !source.includes(value));

  if (missing.length > 0) {
    fail(`${label} missing: ${missing.join(", ")}`);
  }

  pass(`${label} present`);
}

const migrations = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (migrations.join("|") !== requiredMigrations.join("|")) {
  fail(`migration order mismatch: ${migrations.join(", ")}`);
}
pass("migration filenames are ordered and complete");

const allMigrationSql = migrations.map(readMigration).join("\n");

includesAll(allMigrationSql, requiredTables, "application tables");
includesAll(allMigrationSql, requiredEnums, "application enums");

if (/\bdrop\s+(table|column|schema)\b/i.test(allMigrationSql)) {
  fail("destructive drop table/column/schema statement found");
}
pass("no destructive drop table/column/schema statements found");

if (/\btruncate\b/i.test(allMigrationSql)) {
  fail("truncate statement found");
}
pass("no truncate statements found");

const initialSchema = readMigration(requiredMigrations[0]);
const rlsMigration = readMigration(requiredMigrations[1]);
const recruitmentRpcMigration = readMigration(requiredMigrations[2]);
const storageMigration = readMigration(requiredMigrations[3]);

includesAll(initialSchema, ["handle_new_user", "on_auth_user_created"], "profile auto-creation trigger");
includesAll(
  rlsMigration,
  ["enable row level security", "can_manage_content", "is_admin"],
  "RLS and role helper objects",
);
includesAll(
  recruitmentRpcMigration,
  ["save_recruitment", "create_recruitment", "set_current_recruitment", "unset_current_recruitment"],
  "recruitment RPC functions",
);
includesAll(
  storageMigration,
  ["project-images", "site-assets", "allowed_mime_types", "file_size_limit"],
  "storage bucket configuration",
);
includesAll(
  storageMigration,
  [
    "public image assets are readable",
    "content managers upload project images",
    "content managers upload site assets",
    "content managers update public image assets",
    "content managers delete public image assets",
  ],
  "storage policies",
);

const developmentSeed = readFileSync("supabase/seed.sql", "utf8");
const productionSeed = readFileSync("supabase/seeds/production.sql", "utf8");

includesAll(developmentSeed, ["Mock", "project-aurora", "website-operation-guide"], "development seed content markers");
includesAll(productionSeed, ["site_settings", "on conflict (id) do nothing"], "production seed minimal baseline");

if (/(projects|notices|recruitments|auth\.users|profiles)\s*\(/i.test(productionSeed)) {
  fail("production seed may include fake content or Auth/profile rows");
}
pass("production seed excludes fake content and Auth/profile rows");
