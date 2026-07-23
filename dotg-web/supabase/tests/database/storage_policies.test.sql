begin;

select plan(16);

select ok(
  exists(select 1 from storage.buckets where id = 'project-images'),
  'project-images bucket exists'
);
select ok(
  exists(select 1 from storage.buckets where id = 'site-assets'),
  'site-assets bucket exists'
);
select ok(
  (select public from storage.buckets where id = 'project-images'),
  'project-images bucket is public'
);
select ok(
  (select public from storage.buckets where id = 'site-assets'),
  'site-assets bucket is public'
);
select ok(
  (select allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp'] from storage.buckets where id = 'project-images'),
  'project-images allows jpeg, png, and webp'
);
select ok(
  (select allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp'] from storage.buckets where id = 'site-assets'),
  'site-assets allows jpeg, png, and webp'
);
select is(
  (select file_size_limit from storage.buckets where id = 'project-images'),
  5242880::bigint,
  'project-images bucket limit is 5MB'
);
select is(
  (select file_size_limit from storage.buckets where id = 'site-assets'),
  8388608::bigint,
  'site-assets bucket limit is 8MB'
);

select ok(
  exists(
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'site_settings'
      and column_name = 'logo_path'
  ),
  'site_settings.logo_path exists'
);
select ok(
  exists(
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'site_settings'
      and column_name = 'hero_image_path'
  ),
  'site_settings.hero_image_path exists'
);
select ok(
  exists(
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'thumbnail_path'
  ),
  'projects.thumbnail_path exists'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'storage.objects'::regclass),
  'storage.objects has RLS enabled'
);
select ok(
  exists(
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public image assets are readable'
      and roles::text[] @> array['anon', 'authenticated']
  ),
  'public image read policy exists'
);
select ok(
  exists(
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'content managers upload project images'
      and with_check like '%project-images%'
      and with_check like '%thumbnail%'
  ),
  'project image upload policy restricts bucket and thumbnail folder'
);
select ok(
  exists(
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'content managers upload site assets'
      and with_check like '%site-assets%'
      and with_check like '%logo%'
      and with_check like '%hero%'
  ),
  'site asset upload policy restricts bucket and asset folders'
);
select ok(
  exists(
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'content managers delete public image assets'
      and qual like '%can_manage_content%'
  ),
  'content manager delete policy exists'
);

select * from finish();

rollback;
