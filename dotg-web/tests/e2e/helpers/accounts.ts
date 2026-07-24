export const e2ePassword =
  process.env.E2E_TEST_PASSWORD ?? "DotG-E2E-local-password-2026";

export const e2eAccounts = {
  member: {
    email: "dotg-e2e-member@example.test",
    role: "member",
    storageState: "tests/e2e/.auth/member.json",
  },
  editor: {
    email: "dotg-e2e-editor@example.test",
    role: "editor",
    storageState: "tests/e2e/.auth/editor.json",
  },
  admin: {
    email: "dotg-e2e-admin@example.test",
    role: "admin",
    storageState: "tests/e2e/.auth/admin.json",
  },
} as const;

export type E2ERole = keyof typeof e2eAccounts;
