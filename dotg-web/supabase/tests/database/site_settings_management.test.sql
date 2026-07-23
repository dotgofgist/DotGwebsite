begin;

select plan(25);

select ok(to_regclass('public.site_settings') is not null, 'site_settings table exists');
select ok(to_regclass('public.contact_items') is not null, 'contact_items table exists');
select ok(to_regclass('public.social_links') is not null, 'social_links table exists');
select throws_ok(
  $$ insert into public.site_settings (id, name, title, description, short_description) values (2, 'Bad', 'Bad', 'Bad', 'Bad') $$,
  '23514',
  'new row for relation "site_settings" violates check constraint "site_settings_singleton_check"',
  'site_settings singleton constraint rejects id other than 1'
);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'settings-editor@example.test', 'x', now(), '{}', '{}', now(), now()),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'settings-member@example.test', 'x', now(), '{}', '{}', now(), now()),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'settings-admin@example.test', 'x', now(), '{}', '{}', now(), now());

insert into public.profiles (id, display_name, role)
values
  ('20000000-0000-4000-8000-000000000001', 'Settings Editor', 'editor'),
  ('20000000-0000-4000-8000-000000000002', 'Settings Member', 'member'),
  ('20000000-0000-4000-8000-000000000003', 'Settings Admin', 'admin')
on conflict (id) do update set role = excluded.role;

set local role anon;

select ok(exists(select 1 from public.site_settings where id = 1), 'anon can select site settings');
select ok(exists(select 1 from public.contact_items where is_active), 'anon can select active contacts');
select is((select count(*)::int from public.contact_items where not is_active), 0, 'anon cannot select inactive contacts');
select is((select count(*)::int from public.social_links where is_active and url is not null), 0, 'anon sees no active social links with URL in seed');
select throws_ok(
  $$ insert into public.contact_items (label, value) values ('Anon', 'Denied') $$,
  '42501',
  'permission denied for table contact_items',
  'anon cannot insert contacts'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

update public.site_settings set name = 'Member Denied' where id = 1;
select is((select name from public.site_settings where id = 1), 'DotG', 'member cannot update site settings');

select throws_ok(
  $$ insert into public.social_links (platform, label, url, is_active) values ('member', 'Member', 'https://example.test', true) $$,
  '42501',
  'new row violates row-level security policy for table "social_links"',
  'member cannot insert social links'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

update public.site_settings
set name = 'Editor Site',
    title = 'Editor Title',
    description = 'Editor Description',
    short_description = 'Editor Short',
    updated_by = '20000000-0000-4000-8000-000000000001'
where id = 1;

select is((select name from public.site_settings where id = 1), 'Editor Site', 'editor can update site settings');

insert into public.contact_items (label, value, href, description, is_active, sort_order)
values ('Editor Contact', 'hello@example.test', 'mailto:hello@example.test', 'Mail us', true, 7);

select ok(exists(select 1 from public.contact_items where label = 'Editor Contact'), 'editor can create contact');

update public.contact_items
set is_active = false,
    sort_order = 8
where label = 'Editor Contact';

select is((select sort_order from public.contact_items where label = 'Editor Contact'), 8, 'editor can update contact sort order');
select is((select is_active from public.contact_items where label = 'Editor Contact'), false, 'editor can deactivate contact');

delete from public.contact_items
where label = 'Editor Contact';

select ok(not exists(select 1 from public.contact_items where label = 'Editor Contact'), 'editor can delete contact');

insert into public.social_links (platform, label, url, description, is_active, sort_order)
values ('github-test', 'GitHub Test', 'https://example.test/github', 'Repo', true, 3);

select ok(exists(select 1 from public.social_links where platform = 'github-test'), 'editor can create social link');

update public.social_links
set label = 'GitHub Updated',
    sort_order = 4
where platform = 'github-test';

select is((select sort_order from public.social_links where platform = 'github-test'), 4, 'editor can update social sort order');

delete from public.social_links
where platform = 'github-test';

select ok(not exists(select 1 from public.social_links where platform = 'github-test'), 'editor can delete social link');

select throws_ok(
  $$ insert into public.contact_items (label, value, sort_order) values ('Bad Sort', 'Bad', -1) $$,
  '23514',
  'new row for relation "contact_items" violates check constraint "contact_items_sort_order_nonnegative_check"',
  'contact sort_order constraint is enforced'
);

select throws_ok(
  $$ insert into public.social_links (platform, label, is_active) values ('missing-url', 'Missing URL', true) $$,
  '23514',
  'new row for relation "social_links" violates check constraint "social_links_active_requires_url_check"',
  'active social link requires URL'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

insert into public.contact_items (label, value, is_active, sort_order)
values ('Admin Contact', 'Admin Value', true, 9);

select ok(exists(select 1 from public.contact_items where label = 'Admin Contact'), 'admin can create contact');

insert into public.social_links (platform, label, url, is_active, sort_order)
values ('admin-social', 'Admin Social', 'https://example.test/admin', true, 9);

select ok(exists(select 1 from public.social_links where platform = 'admin-social'), 'admin can create social link');

set local role anon;

select ok(exists(select 1 from public.social_links where platform = 'admin-social'), 'anon can select active social link with URL');
select ok(exists(select 1 from public.contact_items where label = 'Admin Contact'), 'anon can select active contact');

select * from finish();

rollback;
