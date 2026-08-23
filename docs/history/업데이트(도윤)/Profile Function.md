# Profile Function

- History folder: 업데이트(도윤)
- Started: 2026-08-20
- Status: Planned

## Purpose

The next development chapter adds a complete profile function to DotG. This document records the starting point, intended scope, implementation order, and completion criteria before code changes begin.

## Current Baseline

The project already has a minimal `public.profiles` table connected one-to-one with `auth.users`.

- A profile is created automatically by the `handle_new_user()` trigger.
- The current fields are `id`, `display_name`, `role`, `created_at`, and `updated_at`.
- `getCurrentProfile()` reads the signed-in user's display name and role.
- `member`, `editor`, and `admin` roles are used for authorization.
- Users may read their own profile; admins may read all profiles and update roles.
- The current profile data is used for identity and authorization only.
- There is no public member profile page, self-service profile form, profile image, or dedicated profile feature module yet.

## Goals

1. Let an authenticated user view and safely edit their own profile.
2. Keep role management separate from self-service profile editing.
3. Provide a public member profile only for fields intentionally marked as public.
4. Connect project members to real profiles where appropriate without breaking existing project content.
5. Add profile-image support with the same Storage validation and cleanup standards used elsewhere in the project.
6. Preserve the existing Supabase RLS-first authorization model.

## Planned Scope

### Data Model

- Define the profile fields required for members, such as display name, introduction, activity role, links, and avatar path.
- Decide which fields are private, authenticated-only, or public.
- Add constraints for required text, length, URL schemes, and Storage paths.
- Add migrations and regenerate `database.types.ts`.
- Preserve `profiles.id -> auth.users.id` and the existing `user_role` authorization field.

### Authorization

- Allow users to update only their own editable profile fields.
- Prevent users from changing their own role through profile input or direct API calls.
- Retain admin-only role management and last-admin safety requirements.
- Make public profile reads explicit and limited to approved fields.
- Treat RLS and server-side checks as the final security boundaries.

### Application Structure

- Add a dedicated `src/features/profile` module for types, validation, queries, actions, and components.
- Keep routes thin and place profile-specific logic inside the feature module.
- Reuse the existing Supabase server client, form components, URL validation patterns, and image-management conventions.
- Add the required profile page and profile-edit route after the public/private field policy is fixed.

### Profile Image

- Add a dedicated Storage path policy for avatars.
- Validate MIME type, extension, file size, ownership, and object path on the server.
- Handle upload replacement and failed database updates without leaving avoidable orphan objects.
- Provide a safe fallback when no profile image exists.

### Project Integration

- Evaluate linking `project_members` rows to `profiles` with a nullable profile reference.
- Preserve manually entered member names and roles for historical or external contributors.
- Link to a public profile only when a valid public profile is available.

### Quality and Documentation

- Add database tests for profile RLS, role protection, constraints, and Storage policies.
- Add application tests for validation, queries, actions, and authorization failures.
- Add E2E coverage for viewing and editing one's own profile and for forbidden cross-user edits.
- Document the final schema, profile management flow, privacy policy, and operational checks.

## Implementation Order

1. Confirm product requirements and the public/private field boundary.
2. Design the schema, RLS policies, and avatar Storage paths.
3. Add migrations, generated types, and database tests.
4. Implement the profile feature's types, validation, queries, and Server Actions.
5. Build profile view/edit UI and navigation entry points.
6. Add avatar upload, replacement, and cleanup behavior.
7. Integrate profiles with project members if the relationship is approved.
8. Run lint, type checks, builds, database tests, and E2E tests.
9. Record implemented behavior and any deferred work in this chapter.

## Completion Criteria

- A signed-in user can view and update only their permitted profile fields.
- A user cannot read private data from another profile or change any role through self-service flows.
- Public profile output contains only explicitly approved public fields.
- Avatar operations enforce ownership and leave Storage and database state consistent.
- Existing admin authentication and content-management authorization continue to work.
- Relevant automated tests pass and the final behavior is documented.

## Development Log

### 2026-08-20

- Read the existing project structure, feature boundaries, Supabase schema, authentication helpers, authorization documentation, and prior development history.
- Confirmed the existing profile implementation is an authorization-oriented baseline rather than a user-facing profile function.
- Opened this chapter to guide the next phase of development.
- Renamed the ongoing history folder from `3일차` to `업데이트(도윤)` to avoid implying that all future work belongs to one numbered day. Other workers developing together should be careful not to update log in this folder, since this is log folder for 1 specific person.
- Kept the authorization-oriented `profiles` table separate and added `member_profiles` for visible member cards. This prevents profile-card deletion from affecting Supabase Auth identities or administrator roles.
- Added the `member_profiles` migration with validation constraints, public-read rules, content-manager CRUD policies, and deterministic ordering.
- Added profile validation, queries, Server Actions, public list/detail pages, and protected admin add/edit/delete pages.
- Added square responsive profile cards with image or initial fallbacks, skills, position, and summary.
- Added public/admin navigation entries, generated database typing, validation tests, and `docs/profile-management.md`.

## Next Increment

- Replace external image URLs with managed Supabase Storage avatar uploads.
- Add database-level pgTAP coverage for profile policies and constraints.
- Add Playwright coverage for public cards and administrator CRUD.
- Evaluate optional links between project member rows and member profiles.
