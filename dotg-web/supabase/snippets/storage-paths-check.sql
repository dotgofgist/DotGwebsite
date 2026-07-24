with invalid_project_paths as (
  select
    'invalid_project_thumbnail_path' as issue_type,
    id::text as source_id,
    thumbnail_path as path
  from public.projects
  where thumbnail_path is not null
    and (
      thumbnail_path ~ '(^/|\\|//|\.\.|^https?://|^project-images/)'
      or thumbnail_path !~ ('^' || id::text || '/thumbnail/[0-9a-f-]+\.(jpg|png|webp)$')
    )
),
invalid_logo_paths as (
  select
    'invalid_site_logo_path' as issue_type,
    id::text as source_id,
    logo_path as path
  from public.site_settings
  where logo_path is not null
    and (
      logo_path ~ '(^/|\\|//|\.\.|^https?://|^site-assets/)'
      or logo_path !~ '^logo/[0-9a-f-]+\.(jpg|png|webp)$'
    )
),
invalid_hero_paths as (
  select
    'invalid_site_hero_path' as issue_type,
    id::text as source_id,
    hero_image_path as path
  from public.site_settings
  where hero_image_path is not null
    and (
      hero_image_path ~ '(^/|\\|//|\.\.|^https?://|^site-assets/)'
      or hero_image_path !~ '^hero/[0-9a-f-]+\.(jpg|png|webp)$'
    )
)
select *
from invalid_project_paths
union all
select *
from invalid_logo_paths
union all
select *
from invalid_hero_paths
order by issue_type, source_id;
