delete from storage.objects o
where (
    o.bucket_id = 'project-images'
    and o.name ~ '^[0-9a-f-]+/thumbnail/[0-9a-f-]+\.(jpg|png|webp)$'
    and o.created_at < now() - interval '10 minutes'
    and not exists (
      select 1
      from public.projects p
      where p.thumbnail_path = o.name
    )
  )
  or (
    o.bucket_id = 'site-assets'
    and o.name ~ '^(logo|hero)/[0-9a-f-]+\.(jpg|png|webp)$'
    and o.created_at < now() - interval '10 minutes'
    and not exists (
      select 1
      from public.site_settings s
      where s.logo_path = o.name
         or s.hero_image_path = o.name
    )
  )
returning
  bucket_id,
  name as path,
  created_at;
