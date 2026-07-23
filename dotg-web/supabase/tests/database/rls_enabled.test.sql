begin;

select plan(10);

select ok(c.relrowsecurity, 'profiles RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'profiles';

select ok(c.relrowsecurity, 'projects RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'projects';

select ok(c.relrowsecurity, 'project_members RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'project_members';

select ok(c.relrowsecurity, 'project_links RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'project_links';

select ok(c.relrowsecurity, 'notices RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'notices';

select ok(c.relrowsecurity, 'recruitments RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'recruitments';

select ok(c.relrowsecurity, 'recruitment_steps RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'recruitment_steps';

select ok(c.relrowsecurity, 'site_settings RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'site_settings';

select ok(c.relrowsecurity, 'contact_items RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'contact_items';

select ok(c.relrowsecurity, 'social_links RLS enabled')
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'social_links';

select * from finish();

rollback;
