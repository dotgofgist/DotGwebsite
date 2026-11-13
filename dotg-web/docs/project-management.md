# Project Management

Admin project management uses authenticated Supabase server clients and RLS. The UI submits Server Actions; components never call Supabase directly.

## Flow

```text
Admin project page
-> admin-queries.ts
-> requireContentManager()
-> Supabase SELECT under RLS
```

```text
ProjectForm
-> Server Action
-> validation
-> requireContentManager()
-> Supabase mutation under RLS
-> revalidatePath
-> redirect
```

## States

- Development status: `planning`, `developing`, `released`, `archived`
- Publication status: `draft`, `published`, `archived`

New projects default to `planning` and `draft`.

## Input Formats

- Tags: comma-separated text, for example `Unity, 2D, Puzzle`
- Members: one row per member, `name|role`
- Links: one row per link, `type|label|https://url`

Allowed link types are `github`, `website`, `download`, `youtube`, `steam`, and `itchio`.

## Project Trailers

The optional **트레일러 영상 URL** field on the create/edit form accepts HTTPS YouTube video links (`watch`, `youtu.be`, `shorts`, `live`, or `embed`) and direct `.mp4`/`.webm` URLs, including query strings. The form previews supported URLs before saving. YouTube links are normalized to a watch URL and rendered using the privacy-enhanced embed host. Other external links remain separate.

The public detail page shows a responsive player below the introduction, with playback controls, no autoplay, and a link to open the video in a new tab. Clearing the field and saving removes the trailer. Projects without a trailer keep their existing layout. Video files must already be hosted; this field does not upload files.

Apply `supabase/migrations/20261113100000_add_project_trailer.sql` before deploying the application changes. It adds nullable `projects.trailer_url` without changing existing records or RLS. Public and admin queries map it to `Project.trailerUrl`.

## Slugs

Slugs are normalized to lowercase and must use English letters, numbers, and single hyphens:

```text
project-aurora
signal-lost
```

## Security

- Mutations call `requireContentManager()`.
- `created_by` and `updated_by` come from the authenticated server session.
- Service Role keys are not used.
- RLS remains the final database boundary.
- Edit saves include the row's previous `updated_at` value. If another admin saved first, the stale update is rejected and the user is asked to refresh.

## Data Integrity

- Published projects require `published_at`.
- Sort orders are non-negative.
- Project links must use `http` or `https`.
- Member `name + role` pairs are unique per project after trim/case normalization.
- Tags, members, and links are trimmed and de-duplicated in server validation before mutation.

## Cache Revalidation

Project create, update, and delete actions revalidate public and admin project paths including `/`, `/projects`, `/admin`, and `/admin/projects`.

## Project Images

Project thumbnails are stored in Supabase Storage under:

```text
{projectId}/thumbnail/{uuid}.{jpg|png|webp}
```

Uploads require JPEG, PNG, or WebP signatures and verified dimensions. Replacement uses a current-path condition when saving the new DB path, and old object removal is limited to the same project prefix.

## Current Limits

Project saves currently use application-level multi-step mutations for relation rows; a dedicated database RPC can be added later if stricter transaction encapsulation is needed.
