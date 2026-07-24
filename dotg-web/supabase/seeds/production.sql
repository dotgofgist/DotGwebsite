-- Production baseline seed.
-- Apply explicitly with:
--   pnpm run supabase:seed:production:remote
--
-- This file must not create Auth users, fake admins, fake public content,
-- passwords, tokens, or project-specific secrets.

insert into public.site_settings (
  id,
  name,
  title,
  description,
  short_description
) values (
  1,
  'DotG',
  'DotG game creation club',
  'DotG publishes club projects, notices, recruitment information, and contact details.',
  'Game creation club'
)
on conflict (id) do nothing;
