alter table public.projects
  add constraint projects_published_at_required_check
  check (publication_status <> 'published' or published_at is not null);

alter table public.notices
  add constraint notices_published_at_required_check
  check (publication_status <> 'published' or published_at is not null),
  add constraint notices_title_length_check
  check (char_length(btrim(title)) <= 150),
  add constraint notices_summary_length_check
  check (char_length(btrim(summary)) <= 300),
  add constraint notices_content_length_check
  check (char_length(btrim(content)) <= 10000);

alter table public.recruitments
  add constraint recruitments_current_requires_published_check
  check (not is_current or publication_status = 'published'),
  add constraint recruitments_title_length_check
  check (char_length(btrim(title)) <= 150),
  add constraint recruitments_summary_length_check
  check (char_length(btrim(summary)) <= 500);

alter table public.project_links
  add constraint project_links_http_url_check
  check (url ~* '^https?://');

alter table public.contact_items
  add constraint contact_items_href_protocol_check
  check (href is null or href ~* '^(https?://|mailto:)');

alter table public.social_links
  add constraint social_links_url_protocol_check
  check (url is null or url ~* '^https?://');

alter table public.recruitments
  add constraint recruitments_application_url_protocol_check
  check (application_url is null or btrim(application_url) = '' or application_url ~* '^https?://'),
  add constraint recruitments_contact_href_protocol_check
  check (contact_href is null or btrim(contact_href) = '' or contact_href ~* '^https?://');

create unique index project_members_project_id_name_role_key
  on public.project_members (
    project_id,
    lower(btrim(name)),
    lower(btrim(role))
  );

create or replace function public.prevent_site_settings_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'site_settings singleton cannot be deleted' using errcode = '23514';
end;
$$;

create trigger prevent_site_settings_delete
  before delete on public.site_settings
  for each row execute function public.prevent_site_settings_delete();

create or replace function public.set_current_recruitment(p_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_publication_status public.content_status;
begin
  if not public.can_manage_content() then
    raise exception 'content manager role required' using errcode = '42501';
  end if;

  select publication_status
    into v_publication_status
    from public.recruitments
    where id = p_id;

  if not found then
    raise exception 'recruitment not found' using errcode = 'P0002';
  end if;

  if v_publication_status = 'archived' then
    raise exception 'archived recruitment cannot be current' using errcode = '23514';
  end if;

  if v_publication_status <> 'published' then
    raise exception 'only published recruitment can be current' using errcode = '23514';
  end if;

  update public.recruitments
  set is_current = false
  where is_current;

  update public.recruitments
  set is_current = true,
      updated_by = auth.uid()
  where id = p_id;
end;
$$;

grant execute on function public.set_current_recruitment(uuid) to authenticated;
