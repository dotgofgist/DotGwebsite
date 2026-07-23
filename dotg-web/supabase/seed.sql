-- Local development seed data mirrored from the current TypeScript mock data.
-- This file inserts content only; schema, functions, triggers, and policies live in migrations.

insert into public.projects (
  id, slug, title, summary, description, status, publication_status, tags,
  featured, started_at, released_at, published_at, sort_order, created_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'project-aurora',
    'Project Aurora',
    'Mock project summary from src/features/projects/mock-data.ts.',
    'Mock project description from src/features/projects/mock-data.ts.',
    'developing',
    'published',
    array['2D', 'adventure', 'prototype'],
    true,
    '2026-03-01',
    null,
    '2026-02-20 00:00:00+00',
    0,
    '2026-02-20 00:00:00+00'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'signal-lost',
    'Signal Lost',
    'Mock project summary from src/features/projects/mock-data.ts.',
    'Mock project description from src/features/projects/mock-data.ts.',
    'planning',
    'published',
    array['puzzle', 'planning', 'mystery'],
    true,
    null,
    null,
    '2026-04-05 00:00:00+00',
    1,
    '2026-04-05 00:00:00+00'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'project-forge',
    'Project Forge',
    'Mock project summary from src/features/projects/mock-data.ts.',
    'Mock project description from src/features/projects/mock-data.ts.',
    'released',
    'published',
    array['Unity', 'UI', 'development lab'],
    false,
    '2026-01-15',
    '2026-05-20',
    '2026-01-10 00:00:00+00',
    2,
    '2026-01-10 00:00:00+00'
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  status = excluded.status,
  publication_status = excluded.publication_status,
  tags = excluded.tags,
  featured = excluded.featured,
  started_at = excluded.started_at,
  released_at = excluded.released_at,
  published_at = excluded.published_at,
  sort_order = excluded.sort_order;

insert into public.project_members (project_id, name, role, sort_order) values
  ('11111111-1111-4111-8111-111111111111', 'Planning Team', 'Gameplay design', 0),
  ('11111111-1111-4111-8111-111111111111', 'Development Team', 'Prototype implementation', 1),
  ('11111111-1111-4111-8111-111111111111', 'Art Team', 'Pixel art direction', 2),
  ('22222222-2222-4222-8222-222222222222', 'Planning Team', 'Puzzle structure design', 0),
  ('22222222-2222-4222-8222-222222222222', 'Sound Team', 'Atmosphere design', 1),
  ('33333333-3333-4333-8333-333333333333', 'Development Team', 'Feature experiments', 0),
  ('33333333-3333-4333-8333-333333333333', 'Planning Team', 'Test scenarios', 1),
  ('33333333-3333-4333-8333-333333333333', 'Art Team', 'UI style exploration', 2),
  ('33333333-3333-4333-8333-333333333333', 'Sound Team', 'Effect testing', 3)
on conflict (project_id, sort_order) do update set
  name = excluded.name,
  role = excluded.role;

insert into public.notices (
  id, slug, title, summary, content, pinned, publication_status, published_at, created_at, updated_at
) values
  (
    '44444444-4444-4444-8444-444444444444',
    'website-operation-guide',
    'Website operation guide',
    'Project and recruitment information is updated step by step.',
    'Local seed content mirrored from src/features/notices/mock-data.ts.',
    true,
    'published',
    '2026-07-01 00:00:00+00',
    '2026-07-01 00:00:00+00',
    '2026-07-08 00:00:00+00'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'project-registration-guide',
    'Project registration guide',
    'Completed and in-progress projects will be organized here.',
    'Local seed content mirrored from src/features/notices/mock-data.ts.',
    false,
    'published',
    '2026-06-24 00:00:00+00',
    '2026-06-24 00:00:00+00',
    '2026-06-24 00:00:00+00'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'recruitment-notice-guide',
    'Recruitment notice guide',
    'Recruitment schedules and application details are shown on the recruitment page.',
    'Local seed content mirrored from src/features/notices/mock-data.ts.',
    false,
    'published',
    '2026-06-17 00:00:00+00',
    '2026-06-17 00:00:00+00',
    '2026-06-17 00:00:00+00'
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'activity-record-update',
    'Activity record update',
    'Major game jam and presentation activity records will be organized later.',
    'Local seed content mirrored from src/features/notices/mock-data.ts.',
    false,
    'published',
    '2026-06-10 00:00:00+00',
    '2026-06-10 00:00:00+00',
    '2026-06-10 00:00:00+00'
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  pinned = excluded.pinned,
  publication_status = excluded.publication_status,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;

insert into public.recruitments (
  id, title, summary, status, publication_status, is_current, target,
  qualifications, activities, starts_at, ends_at, application_url,
  application_label, contact_label, contact_value, contact_href, published_at, updated_at
) values (
  '88888888-8888-4888-8888-888888888888',
  'DotG new member recruitment',
  'Recruitment mock data mirrored from src/features/recruitment/mock-data.ts.',
  'upcoming',
  'published',
  true,
  array[
    'People interested in game creation',
    'People who want to participate in team projects',
    'People exploring planning, development, art, or sound'
  ],
  array[
    'Game development experience is not required.',
    'Members should respect each other and collaborate.',
    'Members should participate in communication and feedback.'
  ],
  array[
    'Game idea planning',
    'Prototype and project development',
    'Game testing and feedback',
    'Game jam, presentation, and review activities'
  ],
  null,
  null,
  null,
  'Application link pending',
  null,
  null,
  null,
  '2026-07-01 00:00:00+00',
  '2026-07-01 00:00:00+00'
)
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  status = excluded.status,
  publication_status = excluded.publication_status,
  is_current = excluded.is_current,
  target = excluded.target,
  qualifications = excluded.qualifications,
  activities = excluded.activities,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  application_url = excluded.application_url,
  application_label = excluded.application_label,
  contact_label = excluded.contact_label,
  contact_value = excluded.contact_value,
  contact_href = excluded.contact_href,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;

insert into public.recruitment_steps (recruitment_id, title, description, sort_order) values
  ('88888888-8888-4888-8888-888888888888', 'Check recruitment notice', 'Confirm the recruitment period and application method.', 0),
  ('88888888-8888-4888-8888-888888888888', 'Submit application', 'Submit the application form when the link is available.', 1),
  ('88888888-8888-4888-8888-888888888888', 'Application review', 'Additional guidance may be provided if needed.', 2),
  ('88888888-8888-4888-8888-888888888888', 'Final guidance', 'Activity schedule and participation guidance are shared.', 3)
on conflict (recruitment_id, sort_order) do update set
  title = excluded.title,
  description = excluded.description;

insert into public.site_settings (
  id, name, title, description, short_description
) values (
  1,
  'DotG',
  'DotG game creation club',
  'A game creation club that plans, develops, and shares game-making experience.',
  'A creative club for planning, programming, art, and sound.'
)
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  description = excluded.description,
  short_description = excluded.short_description;

insert into public.contact_items (label, value, href, description, is_active, sort_order) values
  ('General inquiries', 'Official contact pending', null, 'The inquiry channel will be updated when confirmed.', true, 0),
  ('Recruitment inquiries', 'See the recruitment page', null, 'Recruitment schedule and method are organized on the recruitment page.', true, 1)
on conflict do nothing;

insert into public.social_links (platform, label, url, description, is_active, sort_order) values
  ('GitHub', 'GitHub', null, 'Project repositories and development records', false, 0),
  ('Instagram', 'Instagram', null, 'Activity photos and short updates', false, 1),
  ('YouTube', 'YouTube', null, 'Presentation videos and production logs', false, 2),
  ('Discord', 'Discord', null, 'Community and project communication space', false, 3)
on conflict do nothing;
