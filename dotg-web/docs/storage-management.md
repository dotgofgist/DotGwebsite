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
- Image dimensions parsed from PNG, JPEG, or WebP metadata

SVG and other active document/image formats are rejected.

Current server-side image limits:

| Image | Max file size | Dimension policy |
| --- | --- | --- |
| Project thumbnail | 5MB | 320x180 minimum, 4096x4096 maximum, 16,777,216 pixels maximum |
| Site logo | 2MB | 2048x2048 maximum, 4,194,304 pixels maximum |
| Site Hero | 8MB | 1280x480 minimum, 6000x4000 maximum, 24,000,000 pixels maximum |

## RLS

- `anon` and `authenticated` can read objects in `project-images` and `site-assets`.
- Only authenticated users whose profile role passes `can_manage_content()` can insert, update, or delete objects.
- Project uploads are constrained to the project thumbnail folder shape.
- Site uploads are constrained to `logo` and `hero` folders.

## Cleanup

- Replacing a project thumbnail uploads the new object, updates the DB path with a current-path condition, then attempts to remove the previous object.
- Removing a project thumbnail clears the DB path with a current-path condition, then attempts to remove the previous object.
- Deleting a project attempts to remove its thumbnail object after the project row is deleted.
- Replacing or removing site logo/Hero images follows the same DB-first cleanup pattern.
- If a DB update fails after a new upload, the action attempts to remove the newly uploaded object before returning an error.
- Deletes are skipped for malformed paths or paths outside the expected project/site prefix. A warning is logged so the path can be reviewed without risking removal of another object's file.

## Integrity Checks

Run these commands after migrations, seed changes, or manual Storage maintenance:

```powershell
pnpm run storage:paths:check
pnpm run storage:dangling:check
pnpm run storage:orphans:check
```

Remote linked-project variants:

```powershell
pnpm run storage:paths:remote
pnpm run storage:dangling:remote
pnpm run storage:orphans:remote
```

`storage:paths:*` reports invalid DB path shapes. `storage:dangling:*` reports DB paths whose Storage object is missing. `storage:orphans:*` reports valid-looking Storage objects not referenced by `projects` or `site_settings`.

Orphan cleanup is dry-run by default:

```powershell
pnpm run storage:orphans:cleanup
pnpm run storage:orphans:cleanup -- --apply
```

The apply mode deletes only recognized project/site image objects older than 10 minutes and still unreferenced at execution time. Review dry-run output first.
