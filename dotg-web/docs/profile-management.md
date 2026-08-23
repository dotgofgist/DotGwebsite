# Profile Management

Public member cards use `member_profiles`; authentication and roles remain in `profiles`.

## Flow

- `/profiles` renders published profiles as square cards.
- `/profiles/[slug]` renders the complete profile details.
- `/admin/profiles` lets an editor or admin add, edit, publish, and delete member profiles.
- All mutations call `requireContentManager()` and are protected again by RLS.

## Data and safety

Names, positions, summaries, details, skills, optional HTTPS links, publication state, and ordering are stored independently from Supabase Auth. Deleting a member profile does not delete an Auth user. The security-sensitive `profiles.role` field is never accepted by these forms.

Image links currently accept `http` and `https`. Managed avatar uploads are a later increment.
