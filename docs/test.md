# 1
Database Test의 Run local supabase database checks
에서는 다음과 같은 오류가 발생했어.
[DotG CI] Running: pnpm supabase db reset
 7764ce1676d8 Extracting [========================Resetting local database...
Recreating database...
Initialising schema...
Seeding globals from roles.sql...
Applying migration 20260723073310_create_initial_content_schema.sql...
NOTICE (42710): extension "pgcrypto" already exists, skipping
Applying migration 20260723073320_add_initial_rls_policies.sql...
Applying migration 20260723090000_add_recruitment_write_functions.sql...
Applying migration 20260724090000_add_public_image_storage.sql...
NOTICE (00000): policy "public image assets are readable" for relation "storage.objects" does not exist, skipping
NOTICE (00000): policy "content managers upload project images" for relation "storage.objects" does not exist, skipping
NOTICE (00000): policy "content managers upload site assets" for relation "storage.objects" does not exist, skipping
NOTICE (00000): policy "content managers update public image assets" for relation "storage.objects" does not exist, skipping
NOTICE (00000): policy "content managers delete public image assets" for relation "storage.objects" does not exist, skipping
Applying migration 20260724120000_harden_admin_data_integrity.sql...
Applying migration 20260724130000_grant_service_role_fixture_access.sql...
Seeding data from supabase/seed.sql...
Restarting containers...
Finished supabase db reset on branch dev.
[DotG CI] Running: pnpm supabase test db
Connecting to local database...
3.36: Pulling from supabase/pg_prove
dcccee43ad5d: Pulling fs layer
06d62d0de6d7: Pulling fs layer
a22cb17b3b93: Pulling fs layer
4f4fb700ef54: Pulling fs layer
4f4fb700ef54: Waiting
a22cb17b3b93: Verifying Checksum
a22cb17b3b93: Download complete
dcccee43ad5d: Verifying Checksum
dcccee43ad5d: Download complete
06d62d0de6d7: Verifying Checksum
06d62d0de6d7: Download complete
dcccee43ad5d: Pull complete
4f4fb700ef54: Verifying Checksum
4f4fb700ef54: Download complete
06d62d0de6d7: Pull complete
a22cb17b3b93: Pull complete
4f4fb700ef54: Pull complete
Digest: sha256:eda7c5e68719e9c8287e78c017118407b48df904a51c935f5ab6098b8c0bc6bc
Status: Downloaded newer image for public.ecr.aws/supabase/pg_prove:3.36
public.ecr.aws/supabase/pg_prove:3.36
/home/runner/work/DotGwebsite/DotGwebsite/dotg-web/supabase/tests/database/admin_data_integrity.test.sql ...... ok
/home/runner/work/DotGwebsite/DotGwebsite/dotg-web/supabase/tests/database/auth_authorization.test.sql ........ ok
/home/runner/work/DotGwebsite/DotGwebsite/dotg-web/supabase/tests/database/initial_schema.test.sql ............ ok
/home/runner/work/DotGwebsite/DotGwebsite/dotg-web/supabase/tests/database/recruitment_management.test.sql .... ok
/home/runner/work/DotGwebsite/DotGwebsite/dotg-web/supabase/tests/database/rls_enabled.test.sql ............... ok
/home/runner/work/DotGwebsite/DotGwebsite/dotg-web/supabase/tests/database/site_settings_management.test.sql .. ok
/home/runner/work/DotGwebsite/DotGwebsite/dotg-web/supabase/tests/database/storage_policies.test.sql .......... ok
All tests successful.
Files=7, Tests=137,  0 wallclock secs ( 0.04 usr  0.01 sys +  0.05 cusr  0.03 csys =  0.13 CPU)
Result: PASS
[DotG CI] Running: pnpm run supabase:types:check

> dotg-web@0.1.0 supabase:types:check /home/runner/work/DotGwebsite/DotGwebsite/dotg-web
> node --experimental-strip-types scripts/check-supabase-types-drift.mts

[DotG Supabase] database.types.ts is out of date.
Run: pnpm run supabase:types
Commit the updated src/lib/supabase/database.types.ts.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
Error: Process completed with exit code 1.

# 2
Production Build의 Build application에서는
다음과 같은 에러가 발생했어.

Run pnpm run ci:build

> dotg-web@0.1.0 ci:build /home/runner/work/DotGwebsite/DotGwebsite/dotg-web
> node --experimental-strip-types scripts/ci-runner.mts build

[DotG CI] Running: pnpm build

> dotg-web@0.1.0 prebuild /home/runner/work/DotGwebsite/DotGwebsite/dotg-web
> node --experimental-strip-types scripts/check-env.mts

[DotG env] local: Supabase public environment is not configured.
[DotG env] Local public mock/config fallback is allowed.

> dotg-web@0.1.0 build /home/runner/work/DotGwebsite/DotGwebsite/dotg-web
> next build

⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

▲ Next.js 16.2.11 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 5.5s
  Running TypeScript ...
  Finished TypeScript in 5.6s ...
  Collecting page data using 3 workers ...
  Generating static pages using 3 workers (0/15) ...
Error occurred prerendering page "/about". Read more: https://nextjs.org/docs/messages/prerender-error
Error: public site settings Supabase access is invalid: NEXT_PUBLIC_SUPABASE_URL is missing; NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.example and docs/environment-configuration.md.
    at <unknown> (.next/server/chunks/ssr/_0z6zqqm._.js:1:1829)
    at j (.next/server/chunks/ssr/_14iwzo-._.js:3:1600)
    at j (.next/server/chunks/ssr/_14iwzo-._.js:3:6918)
    at stringify (<anonymous>) {
  digest: '1601011721'
}
Export encountered an error on /(public)/about/page: /about, exiting the build.
⨯ Next.js build worker exited with code: 1 and signal: null
 ELIFECYCLE  Command failed with exit code 1.
[DotG CI] pnpm build failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
Error: Process completed with exit code 1.

# 3
반영되었어.
