-- Admin account status check.
-- Replace the UUID before running. The query intentionally avoids passwords,
-- tokens, sessions, and unmasked email output.

with target_user as (
  select '<AUTH_USER_UUID>'::uuid as id
),
auth_status as (
  select
    u.id,
    u.email_confirmed_at is not null as email_confirmed,
    u.deleted_at is null as auth_user_active
  from auth.users as u
  join target_user as t on t.id = u.id
),
profile_status as (
  select
    p.id,
    p.role,
    p.id is not null as profile_exists
  from public.profiles as p
  join target_user as t on t.id = p.id
)
select
  t.id,
  coalesce(a.id is not null, false) as auth_user_exists,
  coalesce(a.email_confirmed, false) as email_confirmed,
  coalesce(a.auth_user_active, false) as auth_user_active,
  coalesce(p.profile_exists, false) as profile_exists,
  p.role,
  coalesce(p.role = 'admin', false) as is_admin,
  (
    select count(*)
    from public.profiles
    where role = 'admin'
  ) as admin_profile_count
from target_user as t
left join auth_status as a on a.id = t.id
left join profile_status as p on p.id = t.id;
