# Supabase Remote Deployment

This guide prepares a new hosted Supabase project for DotG without storing project refs, access tokens, DB passwords, service role keys, or real user credentials in the repository.

## Current Structure

Migrations apply in this order:

1. `20260723073310_create_initial_content_schema.sql`
   - Creates `pgcrypto`, enums, application tables, profile trigger, indexes, and update triggers.
2. `20260723073320_add_initial_rls_policies.sql`
   - Creates role helper functions, grants, RLS enablement, and table policies.
3. `20260723090000_add_recruitment_write_functions.sql`
   - Creates recruitment management RPCs and grants them only to `authenticated`.
4. `20260724090000_add_public_image_storage.sql`
   - Creates `project-images` and `site-assets`, applies image bucket settings, adds site image path columns, and creates Storage object policies.

Local development seed:

```text
supabase/seed.sql
```

Production baseline seed:

```text
supabase/seeds/production.sql
```

The production seed only inserts the `site_settings` singleton if it is missing. It does not insert fake projects, notices, recruitments, Auth users, profiles, contacts, or social links.

## First Deployment

1. Create a new Supabase project in the Dashboard.
2. Choose a region close to the expected users and keep the DB password in a password manager.
3. Login with the Supabase CLI:

```powershell
pnpm supabase login
```

4. Link the local project. Supply the project ref interactively or as a CLI argument; do not commit it:

```powershell
pnpm run supabase:link -- --project-ref <PROJECT_REF>
```

5. Review local migration readiness:

```powershell
pnpm run supabase:migrations:check
pnpm run supabase:preflight:remote
```

6. List pending remote migrations:

```powershell
pnpm supabase migration list --linked
```

7. Apply migrations to the linked project:

```powershell
pnpm run supabase:db:push
```

8. Apply production baseline seed only when the project has no `site_settings` row:

```powershell
pnpm run supabase:seed:production:remote
```

9. Run read-only checks:

```powershell
pnpm run supabase:smoke:remote
pnpm run supabase:rls:remote
```

10. Generate remote database types:

```powershell
pnpm run supabase:types:remote
pnpm exec tsc --noEmit
```

11. Set app environment variables in Vercel Preview and Production:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

12. Configure Supabase Auth URLs using `docs/environment-configuration.md`.

## First Admin

Do not create admin users in seeds or migrations.

1. Supabase Dashboard -> Authentication -> Users -> create or invite the first user.
2. Copy the Auth user UUID.
3. Edit `supabase/snippets/bootstrap-admin.sql` locally and replace `<AUTH_USER_UUID>`.
4. Run the SQL in Supabase SQL Editor, or against the explicitly linked project:

```powershell
pnpm supabase db query --linked --file supabase/snippets/bootstrap-admin.sql
```

5. Check the result:

```powershell
pnpm supabase db query --linked --file supabase/snippets/admin-status-check.sql
```

The bootstrap is idempotent for the same UUID. It creates the profile only when the Auth user exists and then sets `role = 'admin'`.

## Storage Checks

Expected buckets:

| Bucket | Public | Limit | MIME Types |
| --- | --- | --- | --- |
| `project-images` | Yes | 5 MB | JPEG, PNG, WebP |
| `site-assets` | Yes | 8 MB bucket limit | JPEG, PNG, WebP |

Expected path policy:

- Project thumbnail uploads: `{projectId}/thumbnail/...`
- Site logo uploads: `logo/...`
- Site hero uploads: `hero/...`
- Anon and authenticated users may read public image objects.
- Only `editor` and `admin` profiles may upload, update, or delete objects.
- `member` users cannot write image objects.

Run:

```powershell
pnpm run supabase:smoke:remote
```

## Repeated Deployment

1. Create new migrations locally.
2. Run local reset and DB tests:

```powershell
pnpm.cmd supabase db reset
pnpm.cmd supabase test db
pnpm.cmd run supabase:types
pnpm.cmd exec tsc --noEmit
```

3. Inspect migration diff if needed:

```powershell
pnpm run supabase:db:diff
```

4. Check remote migration state:

```powershell
pnpm supabase migration list --linked
```

5. Push migrations:

```powershell
pnpm run supabase:db:push
```

6. Regenerate remote types and run smoke checks:

```powershell
pnpm run supabase:types:remote
pnpm run supabase:smoke:remote
pnpm run supabase:rls:remote
```

## Do Not Do

- Do not run `db reset` against a remote or production project.
- Do not truncate production tables.
- Do not apply `supabase/seed.sql` to production.
- Do not hard-code project refs, access tokens, DB passwords, or service role keys.
- Do not create Auth users in SQL seeds.
- Do not edit already-applied migration files.
- Do not rely on Dashboard-only schema changes.
- Do not deploy Vercel from this procedure.

## Troubleshooting

- Link failure: confirm `pnpm supabase login`, the selected organization, and project ref.
- Migration history mismatch: inspect `pnpm supabase migration list --linked`; do not repair or squash without a separate reviewed plan.
- DB password error: use the Dashboard reset/reveal workflow and keep the password outside the repository.
- Bucket missing: confirm `20260724090000_add_public_image_storage.sql` applied and run the smoke query.
- RLS missing: run `pnpm run supabase:rls:remote` and inspect the named policy failures.
- Profile missing: ensure the Auth user was created first, then run the bootstrap SQL.
- Admin denied: confirm `profiles.role = 'admin'`, the user can log in, and the app points to the same Supabase project.
- Type generation failure: check link state and rerun `pnpm run supabase:types:remote`; the script leaves the existing type file untouched on failure.

## Launch Checklist

Automated checks:

- [ ] `pnpm run supabase:migrations:check` passes.
- [ ] `pnpm.cmd supabase db reset` passes locally.
- [ ] `pnpm.cmd supabase test db` passes locally.
- [ ] `pnpm.cmd run supabase:types` succeeds.
- [ ] `pnpm.cmd exec tsc --noEmit` passes.
- [ ] `pnpm run supabase:preflight:remote` shows the intended linked project.
- [ ] `pnpm supabase migration list --linked` shows expected pending migrations.
- [ ] `pnpm run supabase:smoke:remote` passes after migration.
- [ ] `pnpm run supabase:rls:remote` passes after migration.

Manual checks:

- [ ] New Supabase project was created.
- [ ] Correct project ref was linked.
- [ ] Development seed was not applied to remote production.
- [ ] Production seed was applied only if `site_settings` was missing.
- [ ] `project-images` bucket exists.
- [ ] `site-assets` bucket exists.
- [ ] Storage policies are visible in Dashboard.
- [ ] First Auth user was created manually.
- [ ] First user profile exists.
- [ ] First user profile role is `admin`.
- [ ] Preview environment variables are set.
- [ ] Production environment variables are set.
- [ ] Supabase Auth Site URL and Redirect URLs are configured.
- [ ] Admin login was verified manually.
