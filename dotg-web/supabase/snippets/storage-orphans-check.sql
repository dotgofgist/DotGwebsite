with orphan_project_images as (
  select
    'project_image_orphan' as issue_type,
    o.bucket_id,
    o.name as path,
    o.created_at
  from storage.objects o
  where o.bucket_id = 'project-images'
    and o.name ~ '^[0-9a-f-]+/thumbnail/[0-9a-f-]+\.(jpg|png|webp)$'
    and not exists (
      select 1
      from public.projects p
      where p.thumbnail_path = o.name
    )
),
orphan_site_assets as (
  select
    'site_asset_orphan' as issue_type,
    o.bucket_id,
    o.name as path,
    o.created_at
  from storage.objects o
  where o.bucket_id = 'site-assets'
    and o.name ~ '^(logo|hero)/[0-9a-f-]+\.(jpg|png|webp)$'
    and not exists (
      select 1
      from public.site_settings s
      where s.logo_path = o.name
         or s.hero_image_path = o.name
    )
)
select *
from orphan_project_images
union all
select *
from orphan_site_assets
order by created_at, bucket_id, path;
