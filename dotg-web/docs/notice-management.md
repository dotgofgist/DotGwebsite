# Notice Management

Admin notice management uses authenticated Supabase server clients and RLS. Notice UI submits Server Actions; UI components do not call Supabase directly.

## Flow

```text
Admin notices page
-> admin-queries.ts
-> requireContentManager()
-> Supabase SELECT under RLS
```

```text
NoticeForm
-> Server Action
-> validation
-> requireContentManager()
-> Supabase mutation under RLS
-> revalidatePath
-> redirect
```

## Slugs

Slugs are normalized to lowercase and must use English letters, numbers, and single hyphens:

```text
website-operation-guide
recruitment-notice
```

## Body Policy

Notice content is stored as plain text. The public detail UI keeps paragraph rendering based on blank lines. There is no Markdown, HTML editor, attachment, or Storage integration in this phase.

## Publication State

- `draft`: visible to admin managers only.
- `published`: visible on public notice pages.
- `archived`: visible to admin managers only.

New notices default to `draft`. When a notice is first published, `published_at` is set. If a notice later returns to draft or archived, the first published timestamp is kept.

## Pinned Notices

Multiple notices can be pinned. Pinned state is display metadata and is not constrained to a single row.

## Data Integrity

- Published notices require `published_at`.
- Title, summary, and content length limits are enforced in server validation and database checks.
- Edit saves include the row's previous `updated_at` value. If another admin saved first, the stale update is rejected and the user is asked to refresh.

## Security

- Queries and mutations call `requireContentManager()`.
- `created_by` and `updated_by` come from the authenticated server session.
- Service Role keys are not used.
- RLS remains the final database boundary.

## Cache Revalidation

Notice create, update, and delete actions revalidate `/`, `/notices`, `/admin`, `/admin/notices`, and affected notice detail paths.

## Delete vs Archive

Delete permanently removes the notice row. Archive keeps the row available to admins but removes it from public notice pages.
