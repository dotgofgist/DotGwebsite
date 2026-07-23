insert into storage.buckets (id, name, public)
values
  ('project-images', 'project-images', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'storage'
      and table_name = 'buckets'
      and column_name = 'allowed_mime_types'
  ) then
    update storage.buckets
    set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
    where id in ('project-images', 'site-assets');
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'storage'
      and table_name = 'buckets'
      and column_name = 'file_size_limit'
  ) then
    update storage.buckets
    set file_size_limit = case
      when id = 'project-images' then 5242880
      when id = 'site-assets' then 8388608
      else file_size_limit
    end
    where id in ('project-images', 'site-assets');
  end if;
end;
$$;

alter table public.site_settings
  add column if not exists logo_path text,
  add column if not exists hero_image_path text;

drop policy if exists "public image assets are readable" on storage.objects;
drop policy if exists "content managers upload project images" on storage.objects;
drop policy if exists "content managers upload site assets" on storage.objects;
drop policy if exists "content managers update public image assets" on storage.objects;
drop policy if exists "content managers delete public image assets" on storage.objects;

create policy "public image assets are readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('project-images', 'site-assets'));

create policy "content managers upload project images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and public.can_manage_content()
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    and (storage.foldername(name))[2] = 'thumbnail'
  );

create policy "content managers upload site assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'site-assets'
    and public.can_manage_content()
    and (storage.foldername(name))[1] in ('logo', 'hero')
  );

create policy "content managers update public image assets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('project-images', 'site-assets')
    and public.can_manage_content()
  )
  with check (
    bucket_id in ('project-images', 'site-assets')
    and public.can_manage_content()
  );

create policy "content managers delete public image assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('project-images', 'site-assets')
    and public.can_manage_content()
  );
