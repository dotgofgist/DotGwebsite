begin;

select plan(15);

select throws_ok(
  $$ insert into public.projects (slug, title, summary, description, publication_status)
     values ('published-without-date', 'Published without date', 'Summary', 'Description', 'published') $$,
  '23514',
  'new row for relation "projects" violates check constraint "projects_published_at_required_check"',
  'published projects require published_at'
);

select throws_ok(
  $$ insert into public.notices (slug, title, summary, content, publication_status)
     values ('published-notice-without-date', 'Title', 'Summary', 'Content', 'published') $$,
  '23514',
  'new row for relation "notices" violates check constraint "notices_published_at_required_check"',
  'published notices require published_at'
);

select throws_ok(
  $$ insert into public.project_links (project_id, link_type, label, url)
     values ('11111111-1111-4111-8111-111111111111', 'website', 'Bad', 'javascript:alert(1)') $$,
  '23514',
  'new row for relation "project_links" violates check constraint "project_links_http_url_check"',
  'project links require http or https URLs'
);

select throws_ok(
  $$ insert into public.contact_items (label, value, href)
     values ('Bad Contact', 'Bad', 'javascript:alert(1)') $$,
  '23514',
  'new row for relation "contact_items" violates check constraint "contact_items_href_protocol_check"',
  'contact href rejects unsafe protocols'
);

select throws_ok(
  $$ insert into public.social_links (platform, label, url)
     values ('bad-social', 'Bad', 'mailto:hello@example.test') $$,
  '23514',
  'new row for relation "social_links" violates check constraint "social_links_url_protocol_check"',
  'social links require http or https URLs'
);

select throws_ok(
  $$ insert into public.recruitments (title, summary, is_current, publication_status)
     values ('Draft current', 'Draft current summary', true, 'draft') $$,
  '23514',
  'new row for relation "recruitments" violates check constraint "recruitments_current_requires_published_check"',
  'current recruitment must be published'
);

select throws_ok(
  $$ insert into public.recruitments (title, summary, application_url)
     values ('Bad application URL', 'Summary', 'ftp://example.test/apply') $$,
  '23514',
  'new row for relation "recruitments" violates check constraint "recruitments_application_url_protocol_check"',
  'recruitment application URL requires http or https'
);

select throws_ok(
  $$ insert into public.recruitments (title, summary, contact_href)
     values ('Bad contact URL', 'Summary', 'mailto:hello@example.test') $$,
  '23514',
  'new row for relation "recruitments" violates check constraint "recruitments_contact_href_protocol_check"',
  'recruitment contact URL requires http or https'
);

insert into public.project_members (project_id, name, role, sort_order)
values ('11111111-1111-4111-8111-111111111111', 'Duplicate Person', 'Artist', 98);

select throws_ok(
  $$ insert into public.project_members (project_id, name, role, sort_order)
     values ('11111111-1111-4111-8111-111111111111', ' duplicate person ', 'artist', 99) $$,
  '23505',
  'duplicate key value violates unique constraint "project_members_project_id_name_role_key"',
  'project member name and role are unique per project ignoring case and trim'
);

select throws_ok(
  $$ delete from public.site_settings where id = 1 $$,
  '23514',
  'site_settings singleton cannot be deleted',
  'site_settings singleton cannot be deleted'
);

select ok(to_regclass('public.project_members_project_id_name_role_key') is not null, 'project member duplicate index exists');
select ok(to_regprocedure('public.prevent_site_settings_delete()') is not null, 'site settings delete guard exists');
select ok(to_regprocedure('public.set_current_recruitment(uuid)') is not null, 'set current recruitment RPC still exists');

select lives_ok(
  $$ insert into public.contact_items (label, value, href)
     values ('Safe Contact', 'hello@example.test', 'mailto:hello@example.test') $$,
  'contact href allows mailto'
);

select lives_ok(
  $$ insert into public.social_links (platform, label, url, is_active)
     values ('safe-social', 'Safe', 'https://example.test', true) $$,
  'social link allows https'
);

select * from finish();

rollback;
