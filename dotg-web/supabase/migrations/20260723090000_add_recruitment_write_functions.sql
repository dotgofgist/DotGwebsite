create or replace function public.save_recruitment(
  p_id uuid,
  p_title text,
  p_summary text,
  p_status public.recruitment_status,
  p_publication_status public.content_status,
  p_target text[],
  p_qualifications text[],
  p_activities text[],
  p_starts_at text,
  p_ends_at text,
  p_application_url text,
  p_application_label text,
  p_contact_label text,
  p_contact_value text,
  p_contact_href text,
  p_steps jsonb
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_recruitment_id uuid;
  v_existing_published_at timestamptz;
  v_published_at timestamptz;
  v_step jsonb;
begin
  if not public.can_manage_content() then
    raise exception 'content manager role required' using errcode = '42501';
  end if;

  if p_publication_status = 'archived' then
    update public.recruitments
    set is_current = false
    where id = p_id;
  end if;

  if p_id is null then
    v_published_at = case
      when p_publication_status = 'published' then now()
      else null
    end;

    insert into public.recruitments (
      title,
      summary,
      status,
      publication_status,
      is_current,
      target,
      qualifications,
      activities,
      starts_at,
      ends_at,
      application_url,
      application_label,
      contact_label,
      contact_value,
      contact_href,
      published_at,
      created_by,
      updated_by
    )
    values (
      p_title,
      p_summary,
      p_status,
      p_publication_status,
      false,
      p_target,
      p_qualifications,
      p_activities,
      nullif(p_starts_at, '')::timestamptz,
      nullif(p_ends_at, '')::timestamptz,
      nullif(p_application_url, ''),
      p_application_label,
      p_contact_label,
      p_contact_value,
      p_contact_href,
      v_published_at,
      auth.uid(),
      auth.uid()
    )
    returning id into v_recruitment_id;
  else
    select published_at
      into v_existing_published_at
      from public.recruitments
      where id = p_id;

    if not found then
      raise exception 'recruitment not found' using errcode = 'P0002';
    end if;

    v_published_at = case
      when p_publication_status = 'published' then coalesce(v_existing_published_at, now())
      else v_existing_published_at
    end;

    update public.recruitments
    set
      title = p_title,
      summary = p_summary,
      status = p_status,
      publication_status = p_publication_status,
      is_current = case when p_publication_status = 'archived' then false else is_current end,
      target = p_target,
      qualifications = p_qualifications,
      activities = p_activities,
      starts_at = nullif(p_starts_at, '')::timestamptz,
      ends_at = nullif(p_ends_at, '')::timestamptz,
      application_url = nullif(p_application_url, ''),
      application_label = p_application_label,
      contact_label = p_contact_label,
      contact_value = p_contact_value,
      contact_href = p_contact_href,
      published_at = v_published_at,
      updated_by = auth.uid()
    where id = p_id
    returning id into v_recruitment_id;
  end if;

  delete from public.recruitment_steps
  where recruitment_id = v_recruitment_id;

  for v_step in select * from jsonb_array_elements(coalesce(p_steps, '[]'::jsonb))
  loop
    insert into public.recruitment_steps (
      recruitment_id,
      title,
      description,
      sort_order
    )
    values (
      v_recruitment_id,
      btrim(v_step ->> 'title'),
      btrim(v_step ->> 'description'),
      coalesce((v_step ->> 'sortOrder')::integer, 0)
    );
  end loop;

  return v_recruitment_id;
end;
$$;

create or replace function public.create_recruitment(
  p_title text,
  p_summary text,
  p_status public.recruitment_status,
  p_publication_status public.content_status,
  p_target text[],
  p_qualifications text[],
  p_activities text[],
  p_starts_at text,
  p_ends_at text,
  p_application_url text,
  p_application_label text,
  p_contact_label text,
  p_contact_value text,
  p_contact_href text,
  p_steps jsonb
)
returns uuid
language sql
set search_path = public
as $$
  select public.save_recruitment(
    null,
    p_title,
    p_summary,
    p_status,
    p_publication_status,
    p_target,
    p_qualifications,
    p_activities,
    p_starts_at,
    p_ends_at,
    p_application_url,
    p_application_label,
    p_contact_label,
    p_contact_value,
    p_contact_href,
    p_steps
  );
$$;

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

  update public.recruitments
  set is_current = false
  where is_current;

  update public.recruitments
  set is_current = true,
      updated_by = auth.uid()
  where id = p_id;
end;
$$;

create or replace function public.unset_current_recruitment(p_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  if not public.can_manage_content() then
    raise exception 'content manager role required' using errcode = '42501';
  end if;

  update public.recruitments
  set is_current = false,
      updated_by = auth.uid()
  where id = p_id;

  if not found then
    raise exception 'recruitment not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.save_recruitment(
  uuid,
  text,
  text,
  public.recruitment_status,
  public.content_status,
  text[],
  text[],
  text[],
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) from public;
revoke all on function public.set_current_recruitment(uuid) from public;
revoke all on function public.unset_current_recruitment(uuid) from public;
revoke all on function public.create_recruitment(
  text,
  text,
  public.recruitment_status,
  public.content_status,
  text[],
  text[],
  text[],
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) from public;

grant execute on function public.save_recruitment(
  uuid,
  text,
  text,
  public.recruitment_status,
  public.content_status,
  text[],
  text[],
  text[],
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated;
grant execute on function public.set_current_recruitment(uuid) to authenticated;
grant execute on function public.unset_current_recruitment(uuid) to authenticated;
grant execute on function public.create_recruitment(
  text,
  text,
  public.recruitment_status,
  public.content_status,
  text[],
  text[],
  text[],
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated;
