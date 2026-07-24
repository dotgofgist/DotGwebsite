# CI/CD and Deployment

DotG uses GitHub Actions for PR validation, local Supabase checks, local Playwright E2E, Vercel Preview deployment, and manually approved Production deployment.

## Workflows

| Event | Workflow | Job | Purpose | Required |
| --- | --- | --- | --- | --- |
| Pull Request, main push | `CI` | `Static Checks` | lint, typecheck, unit/integration tests, migration policy, secret scan | Yes |
| Pull Request, main push | `CI` | `Database Tests` | local Supabase start/reset, pgTAP, RLS/storage smoke, type drift | Yes |
| Pull Request, main push | `CI` | `Production Build` | Next.js production build | Yes |
| Pull Request, main push | `CI` | `Playwright E2E` | local browser E2E against local Supabase | Yes |
| Pull Request | `Preview Deployment` | `Vercel Preview` | Vercel preview deploy and read-only public smoke | Recommended |
| Manual | `Production Deployment` | `Production Deploy` | approved production migration, deploy, and smoke | Protected |

Production is never deployed from a normal PR or push workflow.

## Local Reproduction

```powershell
pnpm install --frozen-lockfile
pnpm run ci:static
pnpm run ci:database
pnpm run ci:build
pnpm run ci:e2e
```

`ci:database` starts and resets local Supabase. Use it only when it is acceptable to replace local development data.

## Pull Request Checks

| Check | Command | Blocks Merge |
| --- | --- | --- |
| install | `pnpm install --frozen-lockfile` | Yes |
| lint/typecheck | `pnpm run ci:static` | Yes |
| env policy | `pnpm run test:env` | Yes |
| migration policy | `pnpm run supabase:migrations:check` | Yes |
| DB/RLS/storage | `pnpm run ci:database` | Yes |
| type drift | `pnpm run supabase:types:check` | Yes |
| build | `pnpm run ci:build` | Yes |
| E2E | `pnpm run ci:e2e` | Yes |
| release bundle | `pnpm run release:check` | Local pre-release |

PR checks use local Supabase only. Fork PRs do not receive repository secrets.

## Supabase

CI uses the project-local Supabase CLI dependency. The database job runs:

```powershell
pnpm supabase start
pnpm supabase db reset
pnpm supabase test db
pnpm run supabase:types:check
pnpm run supabase:storage:check
pnpm run supabase:rls:check
```

Do not use `supabase db reset --linked` in CI. Production seed is not run automatically.

## Playwright

CI installs Chromium with:

```powershell
pnpm exec playwright install --with-deps chromium
```

The suite runs with one worker, CI retries, failure screenshots, traces, videos, and HTML/test-results artifacts. Storage state files are created in `tests/e2e/.auth` and removed by global teardown.

SEO and accessibility smoke tests are included in the Playwright suite. They can also be run directly:

```powershell
pnpm run test:seo
pnpm run test:a11y
```

## Preview

The preview workflow uses Vercel CLI deployment for same-repository PRs only. Fork PRs are skipped because secrets are unavailable.

Required GitHub `preview` environment secrets:

| Name | Public/Secret | Purpose |
| --- | --- | --- |
| `VERCEL_TOKEN` | Secret | Vercel CLI auth |
| `VERCEL_ORG_ID` | Secret | Vercel project scope |
| `VERCEL_PROJECT_ID` | Secret | Vercel project id |

Configure Preview Supabase environment variables in Vercel, not in GitHub workflow YAML:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Preview smoke is read-only and checks public pages only. It does not log in, mutate content, upload images, or touch production data.

## Production

Production deployment is `workflow_dispatch` only and must be protected by the GitHub `production` environment.

Required production environment controls:

- Required reviewer
- Branch restriction to `main`
- Separate production secrets
- No automatic production seed

Required GitHub `production` environment secrets:

| Name | Public/Secret | Purpose |
| --- | --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Secret | Supabase CLI auth |
| `SUPABASE_PROJECT_REF_PRODUCTION` | Secret | Production Supabase project |
| `SUPABASE_DB_PASSWORD_PRODUCTION` | Secret | Production DB migration auth |
| `VERCEL_TOKEN` | Secret | Vercel CLI auth |
| `VERCEL_ORG_ID` | Secret | Vercel project scope |
| `VERCEL_PROJECT_ID` | Secret | Vercel project id |

The production workflow order is:

1. Confirm branch is `main`.
2. Link production Supabase.
3. Run remote preflight.
4. Apply migrations with `supabase db push`.
5. Build Vercel production.
6. Deploy production.
7. Run read-only public smoke.

## Rollback

Application rollback and DB recovery are separate.

Application rollback:

1. Identify the previous healthy Vercel deployment.
2. Promote it to Production in Vercel.
3. Run `pnpm run smoke:production` with `SMOKE_BASE_URL` and `SMOKE_ALLOW_PRODUCTION=true`.

Database rollback:

- Prefer backward-compatible migrations and forward fixes.
- Do not edit existing migration files after merge.
- Confirm PITR or backup availability before destructive migrations.
- Destructive data changes require separate review and explicit rollback SQL.

## Branch Protection

Recommended required checks for `main`:

- `Static Checks`
- `Database Tests`
- `Production Build`
- `Playwright E2E`
- `Dependency Review`
- `Vercel Preview` when Preview deployment secrets are configured

Also enable required PR review, stale approval dismissal, conversation resolution, force-push protection, and branch deletion protection.
