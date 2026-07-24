# Authorization Model

DotG uses Supabase Auth for identity and `public.profiles.role` for authorization. Role is checked from the database on server requests; client-provided role values, cookies, form fields, and URL parameters are never trusted as authority.

## Identity And Profile

When an Auth user is created, `public.handle_new_user()` inserts a matching `profiles` row with role `member`. If a historical or broken Auth user has no profile, the app treats that user as unauthorized for admin access. It does not auto-create an editor/admin profile.

Roles:

| Feature | anon | member | editor | admin |
| --- | --- | --- | --- | --- |
| Public reads | Allow | Allow | Allow | Allow |
| Admin pages | Deny | Deny | Allow | Allow |
| Project CRUD | Deny | Deny | Allow | Allow |
| Notice CRUD | Deny | Deny | Allow | Allow |
| Recruitment management | Deny | Deny | Allow | Allow |
| Site settings | Deny | Deny | Allow | Allow |
| Storage write | Deny | Deny | Allow | Allow |
| Admin-only checks | Deny | Deny | Deny | Allow |
| Role changes | Deny | Deny | Deny | Dashboard/SQL only for now |

## Responsibility Split

- Proxy refreshes Supabase session cookies and quickly redirects unauthenticated `/admin` requests to `/admin/login`.
- Admin layout calls `requireContentManager()` and blocks authenticated non-managers at `/admin/unauthorized`.
- Server Actions call `requireContentManager()` before input validation and mutation.
- Future admin-only Server Actions must call `requireAdmin()`.
- RLS remains the database boundary for reads, writes, and Storage object access.

Proxy is not the final permission boundary. Layout and Server Actions re-check the current user/profile/role.

## Server Helpers

- `getAuthenticatedIdentity()`: reads the current Supabase Auth user.
- `getCurrentProfile()`: reads the current user's `profiles` row.
- `requireAuthenticatedIdentity()`: redirects anonymous users to `/admin/login`.
- `requireContentManager()`: allows only `editor` or `admin`.
- `requireAdmin()`: allows only `admin`.

The helpers use request-scoped React `cache()`, so repeated checks during one server render/action reuse the same result without creating a global cross-user cache.

## Redirect Policy

Login `next` values are allowed only when they resolve to same-site `/admin` paths. The sanitizer rejects external URLs, protocol-relative URLs, backslashes, control characters, double-encoded bypasses, blocked admin pages, and overly long values. Invalid values fall back to `/admin`.

## Profile Anomalies

- No Auth user: redirect to login.
- Auth user with no profile: unauthorized.
- Profile with `member`: unauthorized for admin.
- Profile query error: unauthorized with `profile-unavailable` reason.
- Deleted or invalid Auth user: treated as logged out by Supabase Auth.

## Role Changes

Role changes are reflected on the next server request because role is read from `profiles`. A downgraded editor cannot keep mutating through an old browser state because every Server Action re-runs the server role check. A newly promoted member can access admin pages on the next request without requiring JWT custom claims.

## Caching

Admin layout is dynamic and no-store. Do not store current users or roles in module-level variables, singleton objects, public HTML caches, or cookies as the final source of authorization.

## First Admin And Last Admin

The first admin bootstrap remains a manual operating procedure documented in `docs/supabase-remote-deployment.md`. The app does not expose an admin promotion RPC or user-management UI.

There is currently no in-app role management, so last-admin protection is handled operationally: role changes must be performed through the Dashboard or reviewed SQL. If a future user-role UI/RPC is added, it should prevent demoting or deleting the final admin.

## Manual Verification Checklist

Anon:
- [ ] `/admin` redirects to `/admin/login`.
- [ ] Admin actions cannot be invoked successfully.
- [ ] Public content remains readable.

Member:
- [ ] Login succeeds.
- [ ] `/admin` redirects to `/admin/unauthorized`.
- [ ] CRUD and Storage uploads fail.

Editor:
- [ ] `/admin` renders.
- [ ] Project, notice, recruitment, settings, contact, SNS, and allowed Storage mutations work.
- [ ] `requireAdmin()` checks fail.

Admin:
- [ ] `/admin` renders.
- [ ] Content mutations work.
- [ ] `requireAdmin()` checks pass.
- [ ] Logout blocks later `/admin` access.

Role changes:
- [ ] Demoting editor to member blocks the next admin request/action.
- [ ] Promoting member to editor allows the next admin request.
- [ ] Server checks override stale client UI.
