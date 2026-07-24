-- Read-only smoke checks for local or linked Supabase databases.
-- This file is a single SQL statement because `supabase db query --file`
-- executes files as prepared statements.

select 'PASS profiles table exists' as result
where to_regclass('public.profiles') is not null
union all
select 'PASS projects table exists'
where to_regclass('public.projects') is not null
union all
select 'PASS project_members table exists'
where to_regclass('public.project_members') is not null
union all
select 'PASS project_links table exists'
where to_regclass('public.project_links') is not null
union all
select 'PASS notices table exists'
where to_regclass('public.notices') is not null
union all
select 'PASS recruitments table exists'
where to_regclass('public.recruitments') is not null
union all
select 'PASS recruitment_steps table exists'
where to_regclass('public.recruitment_steps') is not null
union all
select 'PASS site_settings table exists'
where to_regclass('public.site_settings') is not null
union all
select 'PASS contact_items table exists'
where to_regclass('public.contact_items') is not null
union all
select 'PASS social_links table exists'
where to_regclass('public.social_links') is not null
union all
select 'PASS content_status enum exists'
where to_regtype('public.content_status') is not null
union all
select 'PASS project_status enum exists'
where to_regtype('public.project_status') is not null
union all
select 'PASS project_link_type enum exists'
where to_regtype('public.project_link_type') is not null
union all
select 'PASS recruitment_status enum exists'
where to_regtype('public.recruitment_status') is not null
union all
select 'PASS user_role enum exists'
where to_regtype('public.user_role') is not null
union all
select 'PASS site_settings singleton row exists'
where exists (select 1 from public.site_settings where id = 1)
union all
select 'PASS can_manage_content RPC exists'
where to_regprocedure('public.can_manage_content()') is not null
union all
select 'PASS is_admin RPC exists'
where to_regprocedure('public.is_admin()') is not null
union all
select 'PASS create_recruitment RPC exists'
where to_regprocedure(
  'public.create_recruitment(text,text,public.recruitment_status,public.content_status,text[],text[],text[],text,text,text,text,text,text,text,jsonb)'
) is not null
union all
select 'PASS save_recruitment RPC exists'
where to_regprocedure(
  'public.save_recruitment(uuid,text,text,public.recruitment_status,public.content_status,text[],text[],text[],text,text,text,text,text,text,text,jsonb)'
) is not null
union all
select 'PASS project-images bucket exists'
where exists (select 1 from storage.buckets where id = 'project-images')
union all
select 'PASS site-assets bucket exists'
where exists (select 1 from storage.buckets where id = 'site-assets')
union all
select 'PASS project-images bucket is public'
where (select public from storage.buckets where id = 'project-images')
union all
select 'PASS site-assets bucket is public'
where (select public from storage.buckets where id = 'site-assets')
union all
select 'PASS public image read policy exists'
where exists (
  select 1
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'public image assets are readable'
)
union all
select 'PASS editor project image upload policy exists'
where exists (
  select 1
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'content managers upload project images'
)
union all
select 'PASS editor site asset upload policy exists'
where exists (
  select 1
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname = 'content managers upload site assets'
);
