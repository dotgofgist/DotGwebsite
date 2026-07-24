begin;

select plan(17);

select ok(to_regclass('public.profiles') is not null, 'profiles table exists');
select ok(to_regtype('public.user_role') is not null, 'user_role enum exists');
select ok(to_regprocedure('public.handle_new_user()') is not null, 'handle_new_user trigger function exists');
select ok(to_regprocedure('public.can_manage_content()') is not null, 'can_manage_content function exists');
select ok(to_regprocedure('public.is_admin()') is not null, 'is_admin function exists');

select ok(
  exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
  ),
  'auth.users insert trigger exists'
);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '30000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'auth-member@example.test',
  'x',
  now(),
  '{}',
  '{"display_name":"Auth Member"}',
  now(),
  now()
);

select ok(
  exists (
    select 1
    from public.profiles
    where id = '30000000-0000-4000-8000-000000000001'
      and role = 'member'
      and display_name = 'Auth Member'
  ),
  'new Auth user gets member profile automatically'
);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auth-editor@example.test', 'x', now(), '{}', '{}', now(), now()),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auth-admin@example.test', 'x', now(), '{}', '{}', now(), now()),
  ('30000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auth-missing-profile@example.test', 'x', now(), '{}', '{}', now(), now());

insert into public.profiles (id, display_name, role)
values
  ('30000000-0000-4000-8000-000000000002', 'Editor', 'editor'),
  ('30000000-0000-4000-8000-000000000003', 'Admin', 'admin')
on conflict (id) do update set role = excluded.role;

delete from public.profiles
where id = '30000000-0000-4000-8000-000000000004';

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(public.can_manage_content(), false, 'member is not content manager');
select is(public.is_admin(), false, 'member is not admin');

update public.profiles
set role = 'admin'
where id = '30000000-0000-4000-8000-000000000001';

select is(
  (select role from public.profiles where id = '30000000-0000-4000-8000-000000000001'),
  'member'::public.user_role,
  'member cannot promote own profile role'
);

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000002', true);

select is(public.can_manage_content(), true, 'editor is content manager');
select is(public.is_admin(), false, 'editor is not admin');

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000003', true);

select is(public.can_manage_content(), true, 'admin is content manager');
select is(public.is_admin(), true, 'admin is admin');

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000004', true);

select is(public.can_manage_content(), false, 'missing profile is not content manager');
select is(public.is_admin(), false, 'missing profile is not admin');

select ok(
  not exists (
    select 1
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('handle_new_user', 'can_manage_content', 'is_admin')
      and p.prosecdef
      and not exists (
        select 1
        from unnest(coalesce(p.proconfig, array[]::text[])) as config
        where config like 'search_path=%'
      )
  ),
  'security definer auth functions pin search_path'
);

select * from finish();

rollback;
