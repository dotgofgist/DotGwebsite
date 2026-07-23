begin;

select plan(31);

select ok(to_regclass('public.profiles') is not null, 'profiles table exists');
select ok(to_regclass('public.projects') is not null, 'projects table exists');
select ok(to_regclass('public.project_members') is not null, 'project_members table exists');
select ok(to_regclass('public.project_links') is not null, 'project_links table exists');
select ok(to_regclass('public.notices') is not null, 'notices table exists');
select ok(to_regclass('public.recruitments') is not null, 'recruitments table exists');
select ok(to_regclass('public.recruitment_steps') is not null, 'recruitment_steps table exists');
select ok(to_regclass('public.site_settings') is not null, 'site_settings table exists');
select ok(to_regclass('public.contact_items') is not null, 'contact_items table exists');
select ok(to_regclass('public.social_links') is not null, 'social_links table exists');

select ok(to_regtype('public.content_status') is not null, 'content_status enum exists');
select ok(to_regtype('public.project_status') is not null, 'project_status enum exists');
select ok(to_regtype('public.project_link_type') is not null, 'project_link_type enum exists');
select ok(to_regtype('public.recruitment_status') is not null, 'recruitment_status enum exists');
select ok(to_regtype('public.user_role') is not null, 'user_role enum exists');

select has_pk('public', 'profiles', 'profiles has primary key');
select has_pk('public', 'projects', 'projects has primary key');
select has_pk('public', 'project_members', 'project_members has primary key');
select has_pk('public', 'project_links', 'project_links has primary key');
select has_pk('public', 'notices', 'notices has primary key');
select has_pk('public', 'recruitments', 'recruitments has primary key');
select has_pk('public', 'recruitment_steps', 'recruitment_steps has primary key');
select has_pk('public', 'site_settings', 'site_settings has primary key');
select has_pk('public', 'contact_items', 'contact_items has primary key');
select has_pk('public', 'social_links', 'social_links has primary key');

select ok(to_regclass('public.projects_slug_key') is not null, 'projects slug unique index exists');
select ok(to_regclass('public.notices_slug_key') is not null, 'notices slug unique index exists');
select ok(to_regclass('public.recruitments_one_current_key') is not null, 'current recruitment partial unique index exists');
select ok(to_regprocedure('public.set_updated_at()') is not null, 'set_updated_at function exists');
select ok(to_regprocedure('public.can_manage_content()') is not null, 'can_manage_content function exists');
select ok(to_regprocedure('public.is_admin()') is not null, 'is_admin function exists');

select * from finish();

rollback;
