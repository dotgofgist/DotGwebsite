begin;

select plan(23);

select ok(to_regprocedure('public.create_recruitment(text,text,public.recruitment_status,public.content_status,text[],text[],text[],text,text,text,text,text,text,text,jsonb)') is not null, 'create recruitment RPC exists');
select ok(to_regprocedure('public.save_recruitment(uuid,text,text,public.recruitment_status,public.content_status,text[],text[],text[],text,text,text,text,text,text,text,jsonb)') is not null, 'save recruitment RPC exists');
select ok(to_regprocedure('public.set_current_recruitment(uuid)') is not null, 'set current recruitment RPC exists');
select ok(to_regprocedure('public.unset_current_recruitment(uuid)') is not null, 'unset current recruitment RPC exists');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'editor@example.test', 'x', now(), '{}', '{}', now(), now()),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'member@example.test', 'x', now(), '{}', '{}', now(), now()),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.test', 'x', now(), '{}', '{}', now(), now());

insert into public.profiles (id, display_name, role)
values
  ('10000000-0000-4000-8000-000000000001', 'Editor', 'editor'),
  ('10000000-0000-4000-8000-000000000002', 'Member', 'member'),
  ('10000000-0000-4000-8000-000000000003', 'Admin', 'admin')
on conflict (id) do update set role = excluded.role;

set local role anon;

select throws_ok(
  $$ select public.set_current_recruitment('88888888-8888-4888-8888-888888888888') $$,
  '42501',
  'permission denied for function set_current_recruitment',
  'anon cannot execute current RPC'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ select public.set_current_recruitment('88888888-8888-4888-8888-888888888888') $$,
  '42501',
  'content manager role required',
  'member cannot execute current RPC successfully'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

create temporary table recruitment_test_ids (id uuid) on commit drop;
grant select on recruitment_test_ids to public;

insert into recruitment_test_ids
select public.create_recruitment(
  '2026 test recruitment',
  'Recruitment summary',
  'upcoming',
  'draft',
  array['Students interested in games'],
  array['Can join weekly meeting'],
  array['Make games'],
  '2026-03-01T00:00:00.000Z',
  '2026-03-10T23:59:59.000Z',
  '',
  'Apply',
  'Email',
  'dotg@example.test',
  'https://example.test/contact',
  '[{"title":"First","description":"Submit form","sortOrder":0},{"title":"Second","description":"Interview","sortOrder":1}]'::jsonb
);

select is((select count(*)::int from recruitment_test_ids), 1, 'editor can create recruitment');
select is((select created_by from public.recruitments where id = (select id from recruitment_test_ids)), '10000000-0000-4000-8000-000000000001'::uuid, 'created_by records current user');
select is((select updated_by from public.recruitments where id = (select id from recruitment_test_ids)), '10000000-0000-4000-8000-000000000001'::uuid, 'updated_by records current user');
select is((select count(*)::int from public.recruitment_steps where recruitment_id = (select id from recruitment_test_ids)), 2, 'steps are saved with recruitment');
select is((select string_agg(title, ',' order by sort_order) from public.recruitment_steps where recruitment_id = (select id from recruitment_test_ids)), 'First,Second', 'steps are sorted by sort_order');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);

select isnt(public.create_recruitment(
  'Admin recruitment',
  'Admin summary',
  'upcoming',
  'draft',
  array['Target'],
  array['Qualification'],
  array['Activity'],
  '',
  '',
  '',
  'Apply',
  '',
  '',
  '',
  '[]'::jsonb
), null, 'admin can create recruitment');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

select public.save_recruitment(
  (select id from recruitment_test_ids),
  '2026 test recruitment updated',
  'Updated summary',
  'open',
  'published',
  array['Updated target'],
  array['Updated qualification'],
  array['Updated activity'],
  '2026-03-01T00:00:00.000Z',
  '2026-03-10T23:59:59.000Z',
  'https://example.test/apply',
  'Apply now',
  '',
  '',
  '',
  '[{"title":"Only","description":"One step","sortOrder":0}]'::jsonb
);

select is((select title from public.recruitments where id = (select id from recruitment_test_ids)), '2026 test recruitment updated', 'save updates recruitment row');
select is((select count(*)::int from public.recruitment_steps where recruitment_id = (select id from recruitment_test_ids)), 1, 'save replaces steps');
select isnt((select published_at from public.recruitments where id = (select id from recruitment_test_ids)), null, 'published_at is set on first publish');

select public.set_current_recruitment((select id from recruitment_test_ids));

select is((select count(*)::int from public.recruitments where is_current)::int, 1, 'only one current recruitment exists');
select ok((select is_current from public.recruitments where id = (select id from recruitment_test_ids)), 'new current recruitment is marked current');

reset role;
set local role anon;

select is((select count(*)::int from public.recruitments where id = (select id from recruitment_test_ids) and is_current and publication_status = 'published'), 1, 'published current recruitment is publicly selectable');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ update public.recruitments
     set publication_status = 'draft'
     where id = (select id from recruitment_test_ids) $$,
  '23514',
  'new row for relation "recruitments" violates check constraint "recruitments_current_requires_published_check"',
  'current recruitment cannot be changed to draft directly'
);

select public.unset_current_recruitment((select id from recruitment_test_ids));

update public.recruitments
set publication_status = 'draft'
where id = (select id from recruitment_test_ids);

reset role;
set local role anon;

select is((select count(*)::int from public.recruitments where id = (select id from recruitment_test_ids) and is_current), 0, 'draft current recruitment is not publicly selectable');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

update public.recruitments
set publication_status = 'published'
where id = (select id from recruitment_test_ids);

select public.unset_current_recruitment((select id from recruitment_test_ids));

select is((select count(*)::int from public.recruitments where is_current)::int, 0, 'current recruitment can be unset');

update public.recruitments
set publication_status = 'archived'
where id = (select id from recruitment_test_ids);

select throws_ok(
  $$ select public.set_current_recruitment((select id from recruitment_test_ids)) $$,
  '23514',
  'archived recruitment cannot be current'
);

select throws_ok(
  $$ insert into public.recruitments (title, summary, starts_at, ends_at) values ('Bad dates', 'Bad summary', '2026-04-10', '2026-04-01') $$,
  '23514',
  'new row for relation "recruitments" violates check constraint "recruitments_period_order_check"',
  'date order constraint is enforced'
);

select * from finish();

rollback;
