-- One-time first admin bootstrap.
--
-- 1. Create or invite the Auth user in Supabase Dashboard -> Authentication -> Users.
-- 2. Copy the Auth user UUID.
-- 3. Replace the placeholder below.
-- 4. Run this file in SQL Editor, or with an explicitly linked trusted project:
--    pnpm supabase db query --linked --file supabase/snippets/bootstrap-admin.sql
--
-- This script is idempotent for the same Auth user UUID and does not create
-- Auth users or store passwords.

begin;

do $$
declare
  v_auth_user_id_text text := '5ca67392-336f-4cc0-abd7-2e0a48bf82dc';
  v_auth_user_id uuid;
begin
  if v_auth_user_id_text = '5ca67392-336f-4cc0-abd7-2e0a48bf82dc' then
    raise exception 'Replace <AUTH_USER_UUID> before running this bootstrap script.';
  end if;

  v_auth_user_id := v_auth_user_id_text::uuid;

  if not exists (select 1 from auth.users where id = v_auth_user_id) then
    raise exception 'Auth user % does not exist.', v_auth_user_id;
  end if;

  insert into public.profiles (id, display_name, role)
  values (v_auth_user_id, null, 'admin')
  on conflict (id) do update
  set role = 'admin',
      updated_at = now();
end;
$$;

select
  id,
  role,
  created_at,
  updated_at
from public.profiles
where id = '5ca67392-336f-4cc0-abd7-2e0a48bf82dc'::uuid;

commit;
