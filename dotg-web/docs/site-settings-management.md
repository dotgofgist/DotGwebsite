# Site Settings Management

This phase connects text-based site settings, contact items, and SNS links to Supabase.

## Site Settings

`site_settings` is a singleton table. The admin form never accepts an id from the user; saves always upsert `id = 1`.

If Supabase is not fully configured in local development, public pages use `src/config/site.ts` as fallback data and log a warning. Preview, Production, and production-like builds do not use this fallback. If Supabase is configured but the singleton row is missing, public pages raise an error instead of showing config fallback data. A Supabase query error is also treated as an error and is not hidden by fallback data.

The managed fields are:

```text
name
title
description
short_description
```

Logo and Hero image paths are managed in `site_settings` and stored in Supabase Storage. Theme and full metadata management are out of scope.

## Contacts

`contact_items` stores text contact entries with optional links. Admins can create, edit, delete, activate, deactivate, and sort entries with `sort_order`.

Public pages show only active rows. When Supabase is configured and the table is empty, public pages show an empty contact state instead of mixing in config data.

## SNS Links

`social_links` stores platform links with optional descriptions. Admins can create, edit, delete, activate, deactivate, and sort links.

Public pages show only rows where:

```text
is_active = true
url is not null
```

An active SNS link without a URL is blocked by server validation and by the database constraint.

## URL Policy

Contact links allow `http`, `https`, and `mailto`. SNS links allow only `http` and `https`. Dangerous protocols such as `javascript:` are rejected before mutation.

## Permissions

Every admin query and mutation calls `requireContentManager()`. Supabase RLS remains the final guard:

- `anon`: public SELECT only
- `member`: public SELECT only, no writes
- `editor`: settings/contact/SNS management
- `admin`: same content-management permissions as editor

Service role keys are not used.

## Cache Revalidation

Settings mutations revalidate:

```text
/
/about
/contact
/admin
/admin/settings
```

## Site Images

Site assets are stored in the `site-assets` bucket:

```text
logo/{uuid}.{jpg|png|webp}
hero/{uuid}.{jpg|png|webp}
```

Uploads require JPEG, PNG, or WebP signatures and verified dimensions. Replacement uses a current-path condition when saving the new DB path, and old object removal is limited to the matching `logo` or `hero` prefix.

## Delete vs Disable

Deleting a contact or SNS link is permanent. To keep history while hiding an item publicly, admins should disable it instead.

## Out Of Scope

Navigation editing, user role management, audit logs, and realtime subscriptions are not implemented in this phase.
