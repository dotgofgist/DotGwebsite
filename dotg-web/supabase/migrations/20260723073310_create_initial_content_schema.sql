create extension if not exists "pgcrypto" with schema extensions;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.project_status as enum ('planning', 'developing', 'released', 'archived');
create type public.project_link_type as enum ('github', 'website', 'download', 'youtube', 'steam', 'itchio');
create type public.recruitment_status as enum ('upcoming', 'open', 'closed', 'always');
create type public.user_role as enum ('member', 'editor', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text not null,
  description text not null,
  thumbnail_path text,
  status public.project_status not null default 'planning',
  publication_status public.content_status not null default 'draft',
  tags text[] not null default '{}',
  featured boolean not null default false,
  started_at date,
  released_at date,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_title_not_blank_check check (length(btrim(title)) > 0),
  constraint projects_summary_not_blank_check check (length(btrim(summary)) > 0),
  constraint projects_description_not_blank_check check (length(btrim(description)) > 0),
  constraint projects_sort_order_nonnegative_check check (sort_order >= 0),
  constraint projects_release_after_start_check check (
    started_at is null or released_at is null or released_at >= started_at
  )
);

create table public.project_members (
  id uuid primary key default extensions.gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  role text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_members_name_not_blank_check check (length(btrim(name)) > 0),
  constraint project_members_role_not_blank_check check (length(btrim(role)) > 0),
  constraint project_members_sort_order_nonnegative_check check (sort_order >= 0)
);

create table public.project_links (
  id uuid primary key default extensions.gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  link_type public.project_link_type not null,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_links_label_not_blank_check check (length(btrim(label)) > 0),
  constraint project_links_url_not_blank_check check (length(btrim(url)) > 0),
  constraint project_links_sort_order_nonnegative_check check (sort_order >= 0)
);

create table public.notices (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text not null,
  content text not null,
  pinned boolean not null default false,
  publication_status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notices_slug_format_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint notices_title_not_blank_check check (length(btrim(title)) > 0),
  constraint notices_summary_not_blank_check check (length(btrim(summary)) > 0),
  constraint notices_content_not_blank_check check (length(btrim(content)) > 0)
);

create table public.recruitments (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  summary text not null,
  status public.recruitment_status not null default 'upcoming',
  publication_status public.content_status not null default 'draft',
  is_current boolean not null default false,
  target text[] not null default '{}',
  qualifications text[] not null default '{}',
  activities text[] not null default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  application_url text,
  application_label text not null default '지원하기',
  contact_label text,
  contact_value text,
  contact_href text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruitments_title_not_blank_check check (length(btrim(title)) > 0),
  constraint recruitments_summary_not_blank_check check (length(btrim(summary)) > 0),
  constraint recruitments_application_label_not_blank_check check (length(btrim(application_label)) > 0),
  constraint recruitments_period_order_check check (
    starts_at is null or ends_at is null or ends_at >= starts_at
  )
);

create table public.recruitment_steps (
  id uuid primary key default extensions.gen_random_uuid(),
  recruitment_id uuid not null references public.recruitments(id) on delete cascade,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruitment_steps_title_not_blank_check check (length(btrim(title)) > 0),
  constraint recruitment_steps_description_not_blank_check check (length(btrim(description)) > 0),
  constraint recruitment_steps_sort_order_nonnegative_check check (sort_order >= 0)
);

create table public.site_settings (
  id smallint primary key default 1,
  name text not null,
  title text not null,
  description text not null,
  short_description text not null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton_check check (id = 1),
  constraint site_settings_name_not_blank_check check (length(btrim(name)) > 0),
  constraint site_settings_title_not_blank_check check (length(btrim(title)) > 0),
  constraint site_settings_description_not_blank_check check (length(btrim(description)) > 0),
  constraint site_settings_short_description_not_blank_check check (length(btrim(short_description)) > 0)
);

create table public.contact_items (
  id uuid primary key default extensions.gen_random_uuid(),
  label text not null,
  value text not null,
  href text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_items_label_not_blank_check check (length(btrim(label)) > 0),
  constraint contact_items_value_not_blank_check check (length(btrim(value)) > 0),
  constraint contact_items_sort_order_nonnegative_check check (sort_order >= 0)
);

create table public.social_links (
  id uuid primary key default extensions.gen_random_uuid(),
  platform text not null,
  label text not null,
  url text,
  description text,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_links_platform_not_blank_check check (length(btrim(platform)) > 0),
  constraint social_links_label_not_blank_check check (length(btrim(label)) > 0),
  constraint social_links_active_requires_url_check check (not is_active or url is not null),
  constraint social_links_sort_order_nonnegative_check check (sort_order >= 0)
);

create unique index projects_slug_key on public.projects (slug);
create index projects_published_sort_idx on public.projects (featured desc, sort_order asc, published_at desc)
  where publication_status = 'published';
create index projects_status_idx on public.projects (status);
create unique index project_links_project_id_url_key on public.project_links (project_id, url);
create unique index project_members_project_id_sort_order_key on public.project_members (project_id, sort_order);
create unique index notices_slug_key on public.notices (slug);
create index notices_published_sort_idx on public.notices (pinned desc, published_at desc)
  where publication_status = 'published';
create index recruitments_published_sort_idx on public.recruitments (is_current desc, published_at desc)
  where publication_status = 'published';
create unique index recruitments_one_current_key on public.recruitments (is_current)
  where is_current;
create unique index recruitment_steps_recruitment_id_sort_order_key
  on public.recruitment_steps (recruitment_id, sort_order);
create index contact_items_active_sort_idx on public.contact_items (sort_order asc)
  where is_active;
create index social_links_active_sort_idx on public.social_links (sort_order asc)
  where is_active and url is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name'), ''),
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger set_project_members_updated_at before update on public.project_members
  for each row execute function public.set_updated_at();
create trigger set_project_links_updated_at before update on public.project_links
  for each row execute function public.set_updated_at();
create trigger set_notices_updated_at before update on public.notices
  for each row execute function public.set_updated_at();
create trigger set_recruitments_updated_at before update on public.recruitments
  for each row execute function public.set_updated_at();
create trigger set_recruitment_steps_updated_at before update on public.recruitment_steps
  for each row execute function public.set_updated_at();
create trigger set_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger set_contact_items_updated_at before update on public.contact_items
  for each row execute function public.set_updated_at();
create trigger set_social_links_updated_at before update on public.social_links
  for each row execute function public.set_updated_at();
