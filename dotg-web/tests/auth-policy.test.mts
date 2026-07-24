import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAdminLoginPath,
  getSafeAdminReturnPath,
} from "../src/features/auth/redirects.ts";
import {
  isAdminRole,
  isContentManagerRole,
  type UserRole,
} from "../src/features/auth/types.ts";

describe("safe admin redirects", () => {
  it("allows same-site admin paths", () => {
    assert.equal(getSafeAdminReturnPath("/admin/projects"), "/admin/projects");
    assert.equal(
      getSafeAdminReturnPath("/admin/projects?tab=published#top"),
      "/admin/projects?tab=published#top",
    );
  });

  it("defaults empty, blocked, and overly long next values to /admin", () => {
    assert.equal(getSafeAdminReturnPath(""), "/admin");
    assert.equal(getSafeAdminReturnPath("   "), "/admin");
    assert.equal(getSafeAdminReturnPath("/admin/login"), "/admin");
    assert.equal(getSafeAdminReturnPath("/admin/unauthorized"), "/admin");
    assert.equal(getSafeAdminReturnPath(`/admin/${"x".repeat(2050)}`), "/admin");
  });

  it("blocks external, protocol-relative, backslash, control, and encoded bypasses", () => {
    const unsafeValues = [
      "https://evil.example/admin",
      "//evil.example/admin",
      "javascript:alert(1)",
      "/\\evil.example",
      "/admin\\evil",
      "/admin%5cevil",
      "%2f%2fevil.example%2fadmin",
      "%252f%252fevil.example%252fadmin",
      "/admin%00/projects",
    ];

    for (const value of unsafeValues) {
      assert.equal(getSafeAdminReturnPath(value), "/admin", value);
    }
  });

  it("creates login paths only with safe next parameters", () => {
    assert.equal(
      createAdminLoginPath("/admin/projects"),
      "/admin/login?next=%2Fadmin%2Fprojects",
    );
    assert.equal(createAdminLoginPath("https://evil.example"), "/admin/login");
  });
});

describe("role predicates", () => {
  it("separates content manager and admin roles", () => {
    const roles: UserRole[] = ["member", "editor", "admin"];

    assert.deepEqual(roles.map(isContentManagerRole), [false, true, true]);
    assert.deepEqual(roles.map(isAdminRole), [false, false, true]);
  });

  it("rejects missing roles", () => {
    assert.equal(isContentManagerRole(null), false);
    assert.equal(isContentManagerRole(undefined), false);
    assert.equal(isAdminRole(null), false);
    assert.equal(isAdminRole(undefined), false);
  });
});
