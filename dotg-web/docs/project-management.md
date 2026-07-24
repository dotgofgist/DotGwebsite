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

## Slugs

Slugs must use lowercase English letters, numbers, and hyphens:

```text
project-aurora
signal-lost
```

## Security

- Mutations call `requireContentManager()`.
- `created_by` and `updated_by` come from the authenticated server session.
- Service Role keys are not used.
- RLS remains the final database boundary.

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
