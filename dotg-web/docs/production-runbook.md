# Production Runbook

This runbook is for operating the DotG production site after CI, Preview, and release checks are in place.

## Deployment

1. Confirm the PR is merged into `main`.
2. Confirm GitHub Actions checks are passing:
   - `Static Checks`
   - `Database Tests`
   - `Production Build`
   - `Playwright E2E`
   - `Dependency Review`
3. Confirm Vercel Preview smoke passed.
4. Confirm production Supabase backups or PITR are available.
5. Confirm production environment variables are configured in Vercel.
6. Trigger the `Production Deployment` workflow manually.
7. Approve the GitHub `production` environment review.
8. Confirm production read-only smoke passes.

Do not run production seed as part of a normal deployment.

## Incident Checks

### Site-Wide 500

- Check Vercel deployment logs.
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Run production read-only smoke with `SMOKE_BASE_URL`.
- Roll back the Vercel deployment if the migration is backward compatible.

### Supabase Connection Failure

- Check Supabase project status and API health.
- Check Vercel environment variables.
- Run `pnpm run supabase:smoke:remote` only after confirming the linked project is production.
- Avoid DB reset or mutation commands.

### Auth Failure

- Check Supabase Auth Site URL and Redirect URLs.
- Check `/admin/login` in production.
- Check the affected user's `profiles.role`.
- Do not use production admin credentials in automated tests.

### Storage Image Failure

- Check public bucket status for `project-images` and `site-assets`.
- Run read-only storage checks first:
  - `pnpm run storage:paths:remote`
  - `pnpm run storage:dangling:remote`
  - `pnpm run storage:orphans:remote`
- Do not run cleanup commands without reviewing the output.

### Admin CRUD Failure

- Check Vercel server action logs.
- Check Supabase RLS policies and role helper functions.
- Confirm the user has `editor` or `admin`.
- Confirm form validation errors are user-safe and do not expose SQL details.

### Migration Failure

- Stop deployment before Vercel production deploy if migrations fail.
- Prefer forward-fix migrations.
- Do not edit applied migration files.
- Confirm backup/PITR before destructive fixes.

## Recovery

Application rollback:

1. Promote the previous healthy Vercel deployment.
2. Run read-only production smoke.
3. Check Vercel logs for recurring errors.

Database recovery:

1. Prefer forward-fix.
2. Use PITR/backup only after confirming data impact.
3. Document the failed migration and recovery action.

Storage recovery:

1. Restore missing object if available.
2. Clear dangling DB path only after confirming the object cannot be restored.
3. Use orphan cleanup in dry-run mode before applying deletion.
