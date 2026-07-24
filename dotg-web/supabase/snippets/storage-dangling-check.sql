with dangling_project_images as (
  select
    'project_thumbnail_missing_storage_object' as issue_type,
    p.id::text as source_id,
    p.thumbnail_path as path
  from public.projects p
  left join storage.objects o
    on o.bucket_id = 'project-images'
   and o.name = p.thumbnail_path
  where p.thumbnail_path is not null
    and o.id is null
),
dangling_logo_images as (
  select
    'site_logo_missing_storage_object' as issue_type,
    s.id::text as source_id,
    s.logo_path as path
  from public.site_settings s
  left join storage.objects o
    on o.bucket_id = 'site-assets'
   and o.name = s.logo_path
  where s.logo_path is not null
    and o.id is null
),
dangling_hero_images as (
  select
    'site_hero_missing_storage_object' as issue_type,
    s.id::text as source_id,
    s.hero_image_path as path
  from public.site_settings s
  left join storage.objects o
    on o.bucket_id = 'site-assets'
   and o.name = s.hero_image_path
  where s.hero_image_path is not null
    and o.id is null
)
select *
from dangling_project_images
union all
select *
from dangling_logo_images
union all
select *
from dangling_hero_images
order by issue_type, source_id;
