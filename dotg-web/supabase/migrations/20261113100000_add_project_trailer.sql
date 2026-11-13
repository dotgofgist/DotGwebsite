alter table public.projects
  add column trailer_url text,
  add constraint projects_trailer_url_check check (
    trailer_url is null or (
      char_length(trailer_url) <= 2048
      and trailer_url ~ '^https://[^[:space:]]+$'
    )
  );

comment on column public.projects.trailer_url is
  'Optional YouTube or direct MP4/WebM trailer URL. Existing project RLS applies.';
