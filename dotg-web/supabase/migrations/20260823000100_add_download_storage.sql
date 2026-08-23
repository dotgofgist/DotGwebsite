insert into storage.buckets (id, name, public)
values ('downloads', 'downloads', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'storage'
      and table_name = 'buckets'
      and column_name = 'file_size_limit'
  ) then
    update storage.buckets
    set file_size_limit = 104857600
    where id = 'downloads';
  end if;
end;
$$;

drop policy if exists "public downloads are readable" on storage.objects;
drop policy if exists "content managers upload downloads" on storage.objects;
drop policy if exists "content managers update downloads" on storage.objects;
drop policy if exists "content managers delete downloads" on storage.objects;

create policy "public downloads are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'downloads');

create policy "content managers upload downloads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'downloads'
  and public.can_manage_content()
);

create policy "content managers update downloads"
on storage.objects for update
to authenticated
using (
  bucket_id = 'downloads'
  and public.can_manage_content()
)
with check (
  bucket_id = 'downloads'
  and public.can_manage_content()
);

create policy "content managers delete downloads"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'downloads'
  and public.can_manage_content()
);
