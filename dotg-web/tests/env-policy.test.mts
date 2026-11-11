import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  canUsePublicMockFallback,
  createSupabaseEnvErrorMessage,
  getRuntimeEnvironment,
  getSupabaseEnvState,
  requireSupabasePublicEnv,
  shouldUsePublicMockFallback,
} from "../src/lib/supabase/env.ts";

const managedEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_VERCEL_ENV",
  "NODE_ENV",
  "VERCEL",
  "VERCEL_ENV",
] as const;

const originalEnv = new Map<string, string | undefined>(
  managedEnvKeys.map((key) => [key, process.env[key]]),
);

function setEnv(name: string, value: string): void {
  process.env[name] = value;
}

function resetManagedEnv(): void {
  for (const key of managedEnvKeys) {
    const originalValue = originalEnv.get(key);

    if (originalValue === undefined) {
      delete process.env[key];
    } else {
      setEnv(key, originalValue);
    }
  }
}

function clearManagedEnv(): void {
  for (const key of managedEnvKeys) {
    delete process.env[key];
  }
}

afterEach(() => {
  resetManagedEnv();
});

describe("Supabase environment policy", () => {
  it("allows local fallback when every Supabase variable is missing", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "development");

    assert.equal(getRuntimeEnvironment(), "local");
    assert.equal(canUsePublicMockFallback(), true);
    assert.equal(shouldUsePublicMockFallback("test scope"), true);
  });

  it("detects a local URL-only partial configuration", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "development");
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");

    const state = getSupabaseEnvState();

    assert.equal(state.configured, false);
    assert.deepEqual(state.issues, ["missing-public-key"]);
    assert.equal(canUsePublicMockFallback(), true);
  });

  it("detects a local publishable-key-only partial configuration", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "development");
    setEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");

    const state = getSupabaseEnvState();

    assert.equal(state.configured, false);
    assert.deepEqual(state.issues, ["missing-url"]);
    assert.equal(canUsePublicMockFallback(), true);
  });

  it("rejects invalid and whitespace-only values", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "development");
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    setEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "   ");

    const state = getSupabaseEnvState();

    assert.equal(state.configured, false);
    assert.deepEqual(state.issues, ["missing-public-key", "invalid-url"]);
  });

  it("requires HTTPS for non-local Supabase URLs", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "development");
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "http://example.supabase.co");
    setEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");

    const state = getSupabaseEnvState();

    assert.equal(state.configured, false);
    assert.deepEqual(state.issues, ["insecure-url"]);
  });

  it("uses the legacy anon key when the publishable key is blank", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "development");
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    setEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "   ");
    setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-placeholder");

    assert.equal(requireSupabasePublicEnv().publicKey, "legacy-placeholder");
  });

  it("prefers the publishable key when both keys are configured", () => {
    clearManagedEnv();
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-placeholder");
    setEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");

    assert.equal(requireSupabasePublicEnv().publicKey, "sb_publishable_example");
  });

  it("forbids preview fallback when Supabase is missing", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "production");
    setEnv("VERCEL_ENV", "preview");

    assert.equal(getRuntimeEnvironment(), "preview");
    assert.equal(canUsePublicMockFallback(), false);
    assert.throws(
      () => shouldUsePublicMockFallback("preview test"),
      /NEXT_PUBLIC_SUPABASE_URL is missing/,
    );
  });

  it("forbids production fallback when Supabase is missing", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "production");
    setEnv("VERCEL_ENV", "production");

    assert.equal(getRuntimeEnvironment(), "production");
    assert.equal(canUsePublicMockFallback(), false);
    assert.throws(
      () => shouldUsePublicMockFallback("production test"),
      /NEXT_PUBLIC_SUPABASE_URL is missing/,
    );
  });

  it("returns configured values without exposing secrets in error messages", () => {
    clearManagedEnv();
    setEnv("NODE_ENV", "production");
    setEnv("VERCEL_ENV", "production");
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    setEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");

    assert.deepEqual(requireSupabasePublicEnv(), {
      url: "https://example.supabase.co",
      publicKey: "sb_publishable_example",
    });

    setEnv("NEXT_PUBLIC_SUPABASE_URL", "notaurl");
    const message = createSupabaseEnvErrorMessage();

    assert.match(message, /NEXT_PUBLIC_SUPABASE_URL/);
    assert.doesNotMatch(message, /sb_publishable_example/);
  });
});
