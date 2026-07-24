# Playwright E2E Testing

DotG E2E tests exercise public pages, admin authentication, role-based access, and editor CRUD flows against a local Next.js app and local Supabase stack.

## Setup

Install dependencies and Playwright browsers:

```powershell
pnpm install
pnpm exec playwright install chromium
pnpm supabase start
pnpm supabase db reset
```

The E2E runner reads the local Supabase anon and service role keys from `pnpm supabase status`. Do not commit service role keys to `.env.local`.

## Commands

```powershell
pnpm run e2e:preflight
pnpm run test:e2e
pnpm run test:e2e:public
pnpm run test:e2e:auth
pnpm run test:e2e:admin
pnpm run test:e2e:mobile
```

Use `pnpm run test:e2e:headed`, `pnpm run test:e2e:debug`, or `pnpm run test:e2e:ui` for local debugging. Reports are written to `playwright-report`, and failure artifacts are written to `test-results/e2e`.

## Safety

By default, E2E tests target:

```env
E2E_BASE_URL=http://localhost:3000
E2E_SUPABASE_URL=http://127.0.0.1:54321
```

The preflight blocks production-like targets and blocks non-local Supabase URLs unless `E2E_ALLOW_REMOTE=true` is explicitly set. Remote E2E runs should use a disposable Supabase project because the tests create and clean up `e2e-*` content and test accounts.

The seeded accounts are:

```text
dotg-e2e-member@example.test
dotg-e2e-editor@example.test
dotg-e2e-admin@example.test
```

Their default local password is controlled by `E2E_TEST_PASSWORD`.
