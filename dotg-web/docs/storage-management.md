# Supabase Storage Image Management

DotG stores uploaded image object paths in Postgres and derives public URLs at query time with Supabase Storage.

## Buckets

| Bucket | Purpose | Public | Limit |
| --- | --- | --- | --- |
| `project-images` | Project thumbnail images | Yes | 5MB |
| `site-assets` | Site logo and main Hero image | Yes | 8MB bucket limit |

The app applies a stricter 2MB server-side limit for site logo uploads.

## Stored Paths

- `projects.thumbnail_path` stores the project thumbnail object path.
- `site_settings.logo_path` stores the logo object path.
- `site_settings.hero_image_path` stores the Hero image object path.
- Public pages never store signed URLs. They call `getPublicUrl()` when mapping query results.

Current path shapes:

- Project thumbnails: `{projectId}/thumbnail/{uuid}.{jpg|png|webp}`
- Site logo: `logo/{uuid}.{jpg|png|webp}`
- Site Hero: `hero/{uuid}.{jpg|png|webp}`

## Validation

Upload server actions accept only JPEG, PNG, and WebP. Validation checks both:

- Browser-provided MIME type
- File signature bytes

SVG and other active document/image formats are rejected.

## RLS

- `anon` and `authenticated` can read objects in `project-images` and `site-assets`.
- Only authenticated users whose profile role passes `can_manage_content()` can insert, update, or delete objects.
- Project uploads are constrained to the project thumbnail folder shape.
- Site uploads are constrained to `logo` and `hero` folders.

## Cleanup

- Replacing a project thumbnail uploads the new object, updates the DB path, then attempts to remove the previous object.
- Removing a project thumbnail clears the DB path, then attempts to remove the previous object.
- Deleting a project attempts to remove its thumbnail object after the project row is deleted.
- Replacing or removing site logo/Hero images follows the same DB-first cleanup pattern.
- If a DB update fails after a new upload, the action attempts to remove the newly uploaded object before returning an error.
