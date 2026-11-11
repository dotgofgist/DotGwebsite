# DotG Website

## 🚀 바로 실행하기

> **실행 후 브라우저에서 [http://localhost:3000](http://localhost:3000)을 여세요.**
> Supabase 설정 없이도 공개 페이지를 샘플 데이터로 확인할 수 있습니다.

**준비:** Node.js 22~24, pnpm 10이 필요합니다.

**처음 실행할 때** — 저장소 루트(`DotGwebsite`)에서 아래 명령을 순서대로 실행하세요.

```powershell
cd dotg-web
pnpm install
pnpm dev
```

이미 `dotg-web` 폴더에 있다면 `cd dotg-web`은 생략하세요.

**다음부터 실행할 때** — `dotg-web` 폴더에서 `pnpm dev`만 실행하면 됩니다.

- **종료:** 실행 중인 터미널에서 `Ctrl+C`를 누르세요.
- **접속 주소:** 기본 주소는 `http://localhost:3000`이며, 포트가 사용 중이면 터미널에 표시된 `Local` 주소를 확인하세요.
- **관리자 페이지 / 실제 데이터:** 아래 [Environment Variables](#environment-variables)의 Supabase 설정이 필요합니다. 관리자 페이지는 Supabase Auth 로그인도 필요합니다.

---

DotG game creation club website built with Next.js App Router, React, TypeScript, Tailwind CSS, and Supabase Auth/Database/Storage.

Local development can run without Supabase environment variables. In that case, supported public pages use mock/config fallback data and print a warning once per query scope. Admin pages still require Supabase Auth and do not use mock fallback.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in these values when connecting to Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Preview and Production deployments must set both variables in Vercel. Missing, partial, invalid, or non-HTTPS hosted Supabase URLs fail environment validation instead of falling back to mock data.

Do not add a service role key to this app. The browser client uses the anon key with Supabase RLS; privileged database access belongs outside the public Next.js bundle.

## Commands

```powershell
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm run test:env
pnpm run test:auth
pnpm run test:admin
pnpm run test:storage
pnpm run e2e:preflight
pnpm run test:e2e
pnpm run ci:static
pnpm run ci:database
pnpm run ci:build
pnpm run ci:e2e
pnpm run test:a11y
pnpm run test:seo
pnpm run release:check
pnpm run env:check
pnpm run env:check:production
pnpm run storage:paths:check
pnpm run storage:dangling:check
pnpm run storage:orphans:check
pnpm supabase db reset
pnpm supabase test db
pnpm run supabase:types
```

`pnpm build` runs `scripts/check-env.ts` first. Local builds without Supabase are treated like production builds by `NODE_ENV=production`, so provide Supabase env values when building locally.

Playwright E2E tests use the local Supabase stack by default and create disposable `e2e-*` fixtures. See `docs/e2e-testing.md` for browser installation, role fixtures, and remote-target safeguards.

GitHub Actions run PR validation, local Supabase tests, Playwright E2E, optional Vercel Preview deployment, and manually approved Production deployment. See `docs/ci-cd.md`.

Before Production, use `docs/release-checklist.md` and `docs/production-runbook.md`. `pnpm run release:check` reproduces the local release verification bundle and resets local Supabase.

## Data Policy

Public projects, notices, recruitment, site settings, contacts, and social links read from Supabase when it is configured. Mock/config fallback is allowed only for local development with incomplete Supabase configuration. If Supabase is configured and a query fails, the error is passed to the app instead of being hidden by fallback data.

## Storage

Images use Supabase Storage public buckets:

- `project-images`: project thumbnails
- `site-assets`: site logo and main hero image

The database stores object paths. Public URLs are created when data is queried. See `docs/storage-management.md` for details.

## Documentation

- `docs/environment-configuration.md`
- `docs/supabase-remote-deployment.md`
- `docs/authorization-model.md`
- `docs/database-schema.md`
- `docs/authentication.md`
- `docs/recruitment-management.md`
- `docs/storage-management.md`
- `docs/e2e-testing.md`
- `docs/ci-cd.md`
- `docs/release-checklist.md`
- `docs/release-readiness.md`
- `docs/production-runbook.md`
