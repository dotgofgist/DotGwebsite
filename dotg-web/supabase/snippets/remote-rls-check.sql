-- Read-only RLS metadata check for local or linked Supabase databases.
-- This file is a single SQL statement because `supabase db query --file`
-- executes files as prepared statements.

select
  case when bool_and(c.relrowsecurity)
    then 'PASS all public application tables have RLS enabled'
    else 'FAIL one or more public application tables are missing RLS'
  end as result
from pg_class as c
join pg_namespace as n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles',
    'projects',
    'project_members',
    'project_links',
    'notices',
    'recruitments',
    'recruitment_steps',
    'site_settings',
    'contact_items',
    'social_links'
  )
union all
select 'PASS anon published project read policy exists'
where exists (
  select 1 from pg_policies
  where schemaname = 'public'
    and tablename = 'projects'
    and policyname = 'projects public select published'
)
union all
select 'PASS anon published notice read policy exists'
where exists (
  select 1 from pg_policies
  where schemaname = 'public'
    and tablename = 'notices'
    and policyname = 'notices public select published'
)
union all
select 'PASS anon published recruitment read policy exists'
where exists (
  select 1 from pg_policies
  where schemaname = 'public'
    and tablename = 'recruitments'
    and policyname = 'recruitments public select published'
)
union all
select 'PASS content manager write policies exist'
where (
  select count(*)
  from pg_policies
  where schemaname = 'public'
    and policyname like '%editors manage content'
) >= 8
union all
select 'PASS member profile role update is not broadly allowed'
where exists (
  select 1 from pg_policies
  where schemaname = 'public'
    and tablename = 'profiles'
    and policyname = 'profiles admin update roles'
)
union all
select 'PASS security definer functions pin search_path'
where not exists (
  select 1
  from pg_proc as p
  join pg_namespace as n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef
    and not exists (
      select 1
      from unnest(coalesce(p.proconfig, array[]::text[])) as config
      where config like 'search_path=%'
    )
);
