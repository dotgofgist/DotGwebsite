create or replace function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role in ('editor', 'admin') from public.profiles as p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role = 'admin' from public.profiles as p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.can_manage_content() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.can_manage_content() to authenticated;
grant execute on function public.is_admin() to authenticated;

grant usage on schema public to anon, authenticated;
grant usage on type public.content_status to anon, authenticated;
grant usage on type public.project_status to anon, authenticated;
grant usage on type public.project_link_type to anon, authenticated;
grant usage on type public.recruitment_status to anon, authenticated;
grant usage on type public.user_role to authenticated;

grant select on public.projects, public.project_members, public.project_links,
  public.notices, public.recruitments, public.recruitment_steps,
  public.site_settings, public.contact_items, public.social_links to anon;

grant select, insert, update, delete on public.projects, public.project_members,
  public.project_links, public.notices, public.recruitments,
  public.recruitment_steps, public.site_settings, public.contact_items,
  public.social_links to authenticated;

grant select, update on public.profiles to authenticated;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_links enable row level security;
alter table public.notices enable row level security;
alter table public.recruitments enable row level security;
alter table public.recruitment_steps enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_items enable row level security;
alter table public.social_links enable row level security;

create policy "profiles select own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles admin select all"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "profiles admin update roles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "projects public select published"
  on public.projects for select
  to anon, authenticated
  using (publication_status = 'published');

create policy "projects editors manage content"
  on public.projects for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "project_members public select published project"
  on public.project_members for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects as p
      where p.id = project_members.project_id
        and p.publication_status = 'published'
    )
  );

create policy "project_members editors manage content"
  on public.project_members for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "project_links public select published project"
  on public.project_links for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects as p
      where p.id = project_links.project_id
        and p.publication_status = 'published'
    )
  );

create policy "project_links editors manage content"
  on public.project_links for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "notices public select published"
  on public.notices for select
  to anon, authenticated
  using (publication_status = 'published');

create policy "notices editors manage content"
  on public.notices for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "recruitments public select published"
  on public.recruitments for select
  to anon, authenticated
  using (publication_status = 'published');

create policy "recruitments editors manage content"
  on public.recruitments for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "recruitment_steps public select published recruitment"
  on public.recruitment_steps for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recruitments as r
      where r.id = recruitment_steps.recruitment_id
        and r.publication_status = 'published'
    )
  );

create policy "recruitment_steps editors manage content"
  on public.recruitment_steps for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "site_settings public select"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings editors manage content"
  on public.site_settings for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "contact_items public select active"
  on public.contact_items for select
  to anon, authenticated
  using (is_active);

create policy "contact_items editors manage content"
  on public.contact_items for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());

create policy "social_links public select active with url"
  on public.social_links for select
  to anon, authenticated
  using (is_active and url is not null);

create policy "social_links editors manage content"
  on public.social_links for all
  to authenticated
  using (public.can_manage_content())
  with check (public.can_manage_content());
