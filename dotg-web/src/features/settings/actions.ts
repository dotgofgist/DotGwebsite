"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContentManager } from "@/features/auth/server";
import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  type ContactItemActionState,
  type SiteSettingsActionState,
  type SocialLinkActionState,
  uuidPattern,
  validateContactItemFormData,
  validateSiteSettingsFormData,
  validateSocialLinkFormData,
} from "./validation";

type SiteSettingsUpdate =
  Database["public"]["Tables"]["site_settings"]["Update"];
type ContactItemInsert =
  Database["public"]["Tables"]["contact_items"]["Insert"];
type ContactItemUpdate =
  Database["public"]["Tables"]["contact_items"]["Update"];
type SocialLinkInsert =
  Database["public"]["Tables"]["social_links"]["Insert"];
type SocialLinkUpdate =
  Database["public"]["Tables"]["social_links"]["Update"];

function revalidateSettingsPaths(): void {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}

export async function updateSiteSettingsAction(
  _previousState: SiteSettingsActionState,
  formData: FormData,
): Promise<SiteSettingsActionState> {
  const manager = await requireContentManager();
  const validation = validateSiteSettingsFormData(formData);

  if (!validation.ok) return validation.state;

  const supabase = await createServerSupabaseClient();
  const payload = {
    id: 1,
    name: validation.values.name,
    title: validation.values.title,
    description: validation.values.description,
    short_description: validation.values.shortDescription,
    updated_by: manager.id,
  } satisfies SiteSettingsUpdate;
  const save = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", 1)
    .eq("updated_at", validation.values.updatedAt ?? "")
    .select("id")
    .maybeSingle();

  if (save.error) {
    return { status: "error", message: "Could not save site settings." };
  }

  if (!save.data) {
    return {
      status: "error",
      message: "Another admin saved site settings first. Refresh and try again.",
    };
  }

  revalidateSettingsPaths();
  redirect("/admin/settings?saved=settings");
}

export async function createContactItemAction(
  _previousState: ContactItemActionState,
  formData: FormData,
): Promise<ContactItemActionState> {
  await requireContentManager();
  const validation = validateContactItemFormData(formData);

  if (!validation.ok) return validation.state;

  const supabase = await createServerSupabaseClient();
  const payload = {
    label: validation.values.label,
    value: validation.values.value,
    href: validation.values.href ?? null,
    description: validation.values.description ?? null,
    is_active: validation.values.isActive,
    sort_order: validation.values.sortOrder,
  } satisfies ContactItemInsert;
  const { data, error } = await supabase
    .from("contact_items")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { status: "error", message: "Could not create contact item." };
  }

  revalidateSettingsPaths();
  redirect(`/admin/settings/contacts/${data.id}/edit?created=1`);
}

export async function updateContactItemAction(
  _previousState: ContactItemActionState,
  formData: FormData,
): Promise<ContactItemActionState> {
  await requireContentManager();
  const validation = validateContactItemFormData(formData);

  if (!validation.ok) return validation.state;

  if (!validation.values.id) {
    return { status: "error", message: "Contact item id is missing." };
  }

  const supabase = await createServerSupabaseClient();
  const payload = {
    label: validation.values.label,
    value: validation.values.value,
    href: validation.values.href ?? null,
    description: validation.values.description ?? null,
    is_active: validation.values.isActive,
    sort_order: validation.values.sortOrder,
  } satisfies ContactItemUpdate;
  const { error } = await supabase
    .from("contact_items")
    .update(payload)
    .eq("id", validation.values.id);

  if (error) {
    return { status: "error", message: "Could not save contact item." };
  }

  revalidateSettingsPaths();
  redirect(`/admin/settings/contacts/${validation.values.id}/edit?saved=1`);
}

export async function deleteContactItemAction(formData: FormData): Promise<never> {
  await requireContentManager();
  const id = formData.get("id");

  if (typeof id !== "string" || !uuidPattern.test(id)) {
    redirect("/admin/settings?error=contact-delete");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("contact_items").delete().eq("id", id);

  if (error) {
    redirect(`/admin/settings/contacts/${id}/edit?error=delete`);
  }

  revalidateSettingsPaths();
  redirect("/admin/settings?deleted=contact");
}

export async function createSocialLinkAction(
  _previousState: SocialLinkActionState,
  formData: FormData,
): Promise<SocialLinkActionState> {
  await requireContentManager();
  const validation = validateSocialLinkFormData(formData);

  if (!validation.ok) return validation.state;

  const supabase = await createServerSupabaseClient();
  const payload = {
    platform: validation.values.platform,
    label: validation.values.label,
    url: validation.values.url ?? null,
    description: validation.values.description ?? null,
    is_active: validation.values.isActive,
    sort_order: validation.values.sortOrder,
  } satisfies SocialLinkInsert;
  const { data, error } = await supabase
    .from("social_links")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { status: "error", message: "Could not create social link." };
  }

  revalidateSettingsPaths();
  redirect(`/admin/settings/social-links/${data.id}/edit?created=1`);
}

export async function updateSocialLinkAction(
  _previousState: SocialLinkActionState,
  formData: FormData,
): Promise<SocialLinkActionState> {
  await requireContentManager();
  const validation = validateSocialLinkFormData(formData);

  if (!validation.ok) return validation.state;

  if (!validation.values.id) {
    return { status: "error", message: "Social link id is missing." };
  }

  const supabase = await createServerSupabaseClient();
  const payload = {
    platform: validation.values.platform,
    label: validation.values.label,
    url: validation.values.url ?? null,
    description: validation.values.description ?? null,
    is_active: validation.values.isActive,
    sort_order: validation.values.sortOrder,
  } satisfies SocialLinkUpdate;
  const { error } = await supabase
    .from("social_links")
    .update(payload)
    .eq("id", validation.values.id);

  if (error) {
    return { status: "error", message: "Could not save social link." };
  }

  revalidateSettingsPaths();
  redirect(`/admin/settings/social-links/${validation.values.id}/edit?saved=1`);
}

export async function deleteSocialLinkAction(formData: FormData): Promise<never> {
  await requireContentManager();
  const id = formData.get("id");

  if (typeof id !== "string" || !uuidPattern.test(id)) {
    redirect("/admin/settings?error=social-delete");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id);

  if (error) {
    redirect(`/admin/settings/social-links/${id}/edit?error=delete`);
  }

  revalidateSettingsPaths();
  redirect("/admin/settings?deleted=social");
}
