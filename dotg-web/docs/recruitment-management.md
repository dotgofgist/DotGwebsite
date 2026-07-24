# Recruitment Management

DotG recruitment management stores multiple recruitment campaigns and exposes at most one campaign to the public site.

## Data Flow

Admin pages use server queries in `src/features/recruitment/admin-queries.ts`. Every admin query calls `requireContentManager()` before reading Supabase data. Public pages keep using `src/features/recruitment/queries.ts`, which only returns a recruitment where `is_current = true` and `publication_status = 'published'`.

## Recruitment And Steps

`recruitments` stores the campaign body. `recruitment_steps` stores ordered process rows with `recruitment_id` and `sort_order`. Step rows use `on delete cascade` from the parent recruitment. The admin mapper converts snake_case rows into the public `Recruitment` shape plus admin-only fields.

## Create And Update

The admin form posts to Server Actions. Validation runs before any mutation. Saves call Supabase RPC:

- `create_recruitment(...)` for new rows
- `save_recruitment(...)` for existing rows

The RPC writes the recruitment row and replaces all steps in one database transaction. New recruitments are created as non-current rows. `created_by` and `updated_by` come from `auth.uid()`, never from form input.

## Status Policy

Recruitment status values are `upcoming`, `open`, `closed`, and `always`. Publication status values are `draft`, `published`, and `archived`.

`published_at` is set the first time a row becomes `published`. Moving a row back to `draft` or `archived` does not erase the previous timestamp.

## Current Policy

Only one recruitment may have `is_current = true`. The partial unique index is the final database guard. Only `published` recruitments can be current; draft and archived rows are blocked by database constraints and by `set_current_recruitment`.

Current management uses:

- `set_current_recruitment(id)`: clears any previous current row and marks the target current
- `unset_current_recruitment(id)`: clears current on the target row

If a uniqueness or status conflict occurs, the UI reports a retryable current selection failure.

## Archive Policy

Permanent deletion is intentionally not implemented in this phase. Archiving sets `publication_status = 'archived'` and clears `is_current`. Archived rows disappear from public pages but remain in the admin history.

## Validation

Server validation checks title, summary, recruitment status, publication status, target list, qualifications, activities, date order, application label, application URL, process rows, and contact fields. Application and contact links must use `http` or `https`.

The database also rejects unsafe application/contact URL protocols. Existing RPC inputs still normalize blank URLs as empty strings in a few optional recruitment contact fields; a future RPC cleanup can convert those blanks to `null` without changing public behavior.

Process input uses one line per step:

```text
Title|Description
```

## RLS

Anon users can read published recruitment rows through public RLS, but public queries additionally require `is_current = true`. Members cannot manage recruitment rows or execute management RPCs. Editors and admins can select and mutate recruitment content through RLS and RPC checks.

Service role keys are not used.

## Cache Revalidation

Recruitment mutations revalidate:

```text
/
/recruitment
/admin
/admin/recruitment
/admin/recruitment/{id}/edit
```

## Out Of Scope

This phase does not implement recruitment application submission, applicant personal data storage, applicant management, notifications, schedules, statistics, contact CRUD, SNS CRUD, Storage, or audit logs.
