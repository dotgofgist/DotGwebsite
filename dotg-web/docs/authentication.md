# DotG Authentication

DotG admin authentication uses Supabase email/password Auth, Supabase SSR cookies, and the `public.profiles.role` column for authorization.

The detailed role and route policy lives in `docs/authorization-model.md`.

## Flow

```text
browser
-> Next.js Proxy session refresh
-> Server Component identity check
-> profiles role check
-> admin layout render
-> Supabase RLS
```

## Roles

- `member`: public site only, no admin access.
- `editor`: admin access and content management.
- `admin`: admin access, content management, and future user role management.

Server code checks `profiles.role` on each request path that needs authorization. Client-rendered role labels are informational only.

## Login

1. Visit `/admin/login`.
2. Submit email and password through a Server Action.
3. Supabase Auth verifies credentials.
4. The app checks `profiles.role`.
5. `editor` and `admin` continue to the safe `next` admin path.
6. `member` or missing profiles are blocked.

External `next` URLs are rejected. Unsafe or missing return paths fall back to `/admin`.

## Logout

Logout is a Server Action. It signs out the current browser session with local scope and redirects to `/admin/login`.

## Admin Account Setup

Do not create real admin users in code, migrations, or seed files.

For local development, create a user in Supabase Studio Authentication, then update the matching profile role:

```sql
update public.profiles
set role = 'admin'
where id = '<AUTH_USER_UUID>';
```

For hosted Supabase, create or invite the user in the Supabase Dashboard and update the matching `profiles.role` value in the database.

The first hosted admin bootstrap procedure is documented in `docs/supabase-remote-deployment.md`. Use `supabase/snippets/bootstrap-admin.sql` only after replacing `<AUTH_USER_UUID>` with a real Auth user UUID from the Dashboard.

## Security Principles

- No Service Role key in the app.
- No secret key in client or server UI code.
- Do not trust `user_metadata` for roles.
- Do not use `getSession()` user data for authorization.
- Check roles on the server through `profiles.role`.
- Keep RLS policies enabled.
- Recheck `requireContentManager()` inside future admin Server Actions.
- Use `requireAdmin()` for future admin-only server operations.
- Treat missing profiles as unauthorized, not as managers.
- Never log passwords, tokens, cookies, or environment values.

## Not Implemented Yet

- Content CRUD
- User management UI
- Password reset
- Public signup
- MFA
