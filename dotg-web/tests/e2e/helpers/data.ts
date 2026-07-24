import { e2eAccounts, e2ePassword } from "./accounts.ts";
import { getSupabaseAdminClient } from "./supabase-admin.ts";

export async function cleanupE2EContent(): Promise<void> {
  const supabase = getSupabaseAdminClient();

  await supabase.from("project_links").delete().like("url", "https://e2e.example/%");
  await supabase.from("projects").delete().like("slug", "e2e-%");
  await supabase.from("notices").delete().like("slug", "e2e-%");
  await supabase.from("contact_items").delete().like("label", "E2E %");
  await supabase.from("social_links").delete().like("platform", "e2e-%");
}

async function findUserByEmail(email: string): Promise<string | undefined> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;

  return data.users.find((user) => user.email === email)?.id;
}

export async function ensureE2EAccounts(): Promise<void> {
  const supabase = getSupabaseAdminClient();

  for (const account of Object.values(e2eAccounts)) {
    const existingId = await findUserByEmail(account.email);
    let userId = existingId;

    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: e2ePassword,
        email_confirm: true,
      });
      if (error) throw error;
      userId = data.user?.id;
    }

    if (!userId) throw new Error(`Could not prepare E2E user for ${account.role}.`);

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, role: account.role }, { onConflict: "id" });
    if (error) throw error;
  }
}

export async function setE2EAccountRole(
  email: string,
  role: "member" | "editor" | "admin",
): Promise<void> {
  const userId = await findUserByEmail(email);
  if (!userId) throw new Error(`Missing E2E user: ${email}`);

  const { error } = await getSupabaseAdminClient()
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) throw error;
}

export async function getProjectBySlug(slug: string) {
  return getSupabaseAdminClient()
    .from("projects")
    .select("id, slug, title, publication_status")
    .eq("slug", slug)
    .maybeSingle();
}

export async function getNoticeBySlug(slug: string) {
  return getSupabaseAdminClient()
    .from("notices")
    .select("id, slug, title, publication_status")
    .eq("slug", slug)
    .maybeSingle();
}
