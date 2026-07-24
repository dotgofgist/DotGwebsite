import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

const migrationNames = readdirSync("supabase/migrations")
  .filter((name) => name.endsWith(".sql"))
  .sort();

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("Supabase deployment assets", () => {
  it("keeps migration history ordered and non-destructive", () => {
    assert.deepEqual(migrationNames, [
      "20260723073310_create_initial_content_schema.sql",
      "20260723073320_add_initial_rls_policies.sql",
      "20260723090000_add_recruitment_write_functions.sql",
      "20260724090000_add_public_image_storage.sql",
    ]);

    const sql = migrationNames
      .map((name) => read(`supabase/migrations/${name}`))
      .join("\n");

    assert.doesNotMatch(sql, /\bdrop\s+(table|column|schema)\b/i);
    assert.doesNotMatch(sql, /\btruncate\b/i);
  });

  it("keeps production seed minimal and separate from development content", () => {
    const productionSeed = read("supabase/seeds/production.sql");

    assert.match(productionSeed, /insert into public\.site_settings/i);
    assert.match(productionSeed, /on conflict \(id\) do nothing/i);
    assert.doesNotMatch(productionSeed, /insert into public\.(projects|notices|recruitments|profiles)/i);
    assert.doesNotMatch(productionSeed, /auth\.users/i);
    assert.doesNotMatch(productionSeed, /project-aurora|website-operation-guide|Mock/i);
  });

  it("documents first admin bootstrap without hard-coded identity or secrets", () => {
    const bootstrap = read("supabase/snippets/bootstrap-admin.sql");
    const statusCheck = read("supabase/snippets/admin-status-check.sql");

    assert.match(bootstrap, /<AUTH_USER_UUID>/);
    assert.match(bootstrap, /auth\.users/);
    assert.match(bootstrap, /role = 'admin'/);
    assert.doesNotMatch(`${bootstrap}\n${statusCheck}`, /service_role|access_token|SUPABASE_ACCESS_TOKEN|SUPABASE_DB_PASSWORD/i);
    assert.doesNotMatch(`${bootstrap}\n${statusCheck}`, /password\s*[:=]/i);
  });

  it("provides read-only remote smoke and RLS checks", () => {
    const smoke = read("supabase/snippets/remote-readonly-smoke.sql");
    const rls = read("supabase/snippets/remote-rls-check.sql");

    assert.match(smoke, /project-images bucket exists/);
    assert.match(smoke, /site-assets bucket exists/);
    assert.match(rls, /all public application tables have RLS enabled/);
    assert.doesNotMatch(`${smoke}\n${rls}`, /^\s*(insert|update|delete|truncate|drop|alter|create|grant|revoke)\b/im);
  });
});
