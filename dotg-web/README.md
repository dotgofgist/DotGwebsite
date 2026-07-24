# DotG Website

DotG game creation club website built with Next.js App Router, React, TypeScript, Tailwind CSS, and Supabase Auth/Database/Storage.

## Local Development

```powershell
pnpm install
pnpm dev
```

The development server runs at `http://localhost:3000` by default.

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
