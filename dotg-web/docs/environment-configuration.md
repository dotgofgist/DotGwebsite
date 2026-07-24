# Environment Configuration

DotG separates three runtime environments:

| Environment | Detection | Supabase env required | Public fallback |
| --- | --- | --- | --- |
| Local development | no Vercel env and `NODE_ENV !== "production"` | No | Allowed only when Supabase env is incomplete |
| Vercel Preview | `VERCEL_ENV=preview` or `NEXT_PUBLIC_VERCEL_ENV=preview` | Yes | Forbidden |
| Vercel Production | `VERCEL_ENV=production` or `NEXT_PUBLIC_VERCEL_ENV=production` | Yes | Forbidden |

`NODE_ENV=production` without Vercel is treated as production-like for fallback policy. This keeps local production builds from silently rendering mock data.

## Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL. Hosted projects must use HTTPS. Local Supabase CLI URLs such as `http://127.0.0.1:54321` are allowed.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key used by the browser and server Supabase clients with RLS.

Both names are public by design because Supabase browser Auth needs them. Do not configure or request a service role key in this app.

## Fallback Policy

Fallback data is allowed only for supported public query paths during local development when Supabase is not fully configured. The app logs a warning once per public query scope and never logs key values.

Fallback is forbidden in:

- Vercel Preview
- Vercel Production
- production-like builds
- admin routes and admin Server Actions
- any path where Supabase is fully configured but a query, network request, permission check, or database operation fails

When Supabase is configured, public query failures are thrown so `error.tsx` or the nearest boundary can handle them.

## Validation Commands

```powershell
pnpm run env:check
pnpm run env:check:production
pnpm run test:env
```

`pnpm build` runs the same environment check before `next build`. For a local build, provide temporary values in PowerShell:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="<local anon key from supabase status>"
pnpm build
```

For Vercel, set both variables in Project Settings -> Environment Variables for Preview and Production. Vercel provides `VERCEL_ENV` automatically.

## Supabase Auth URL Settings

Configure these in Supabase Dashboard -> Authentication -> URL Configuration.

- Site URL: production domain, for example `https://dotg.example.com`.
- Local redirect URLs: `http://localhost:3000/**` and any alternate local port used by the team.
- Preview redirect URLs: add the Vercel preview domain pattern used by the project. Use wildcards carefully and only for the project-owned Vercel domain.
- Production redirect URLs: production domain callback paths only.

Supabase redirect URLs define which origins Auth may redirect back to. The app-level `next` parameter only chooses a safe path inside the already-approved site after login; it does not replace Supabase's redirect allowlist.

Remove stale preview or production URLs when deployment domains change. Do not allow redirect URLs for domains the project does not control.

## Common Errors

- Missing `NEXT_PUBLIC_SUPABASE_URL`: set the Supabase project URL in `.env.local` or Vercel.
- Missing `NEXT_PUBLIC_SUPABASE_ANON_KEY`: set the anon public key, not the legacy publishable variable.
- Invalid URL: include protocol and host, for example `https://project.supabase.co`.
- Insecure hosted URL: use HTTPS for hosted Supabase. HTTP is only allowed for local Supabase CLI URLs.
- Query error after env is configured: fix the database, RLS, network, or schema issue. The app intentionally does not switch to fallback data.
