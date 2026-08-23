create table public.member_profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  position text not null,
  summary text not null,
  details text not null,
  skills text[] not null default '{}',
  image_url text,
  github_url text,
  website_url text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_profiles_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint member_profiles_name_not_blank check (length(btrim(name)) between 1 and 80),
  constraint member_profiles_position_not_blank check (length(btrim(position)) between 1 and 80),
  constraint member_profiles_summary_length check (length(btrim(summary)) between 1 and 240),
  constraint member_profiles_details_length check (length(btrim(details)) between 1 and 5000),
  constraint member_profiles_sort_order check (sort_order >= 0)
);

create unique index member_profiles_slug_key on public.member_profiles (slug);
create index member_profiles_public_sort_idx on public.member_profiles (sort_order, name)
  where is_published;
create trigger set_member_profiles_updated_at before update on public.member_profiles
  for each row execute function public.set_updated_at();

grant select on public.member_profiles to anon, authenticated;
grant select, insert, update, delete on public.member_profiles to authenticated;
alter table public.member_profiles enable row level security;

create policy "member profiles public select published"
  on public.member_profiles for select to anon, authenticated
  using (is_published);
create policy "member profiles managers select all"
  on public.member_profiles for select to authenticated
  using (public.can_manage_content());
create policy "member profiles managers insert"
  on public.member_profiles for insert to authenticated
  with check (public.can_manage_content());
create policy "member profiles managers update"
  on public.member_profiles for update to authenticated
  using (public.can_manage_content()) with check (public.can_manage_content());
create policy "member profiles managers delete"
  on public.member_profiles for delete to authenticated
  using (public.can_manage_content());
