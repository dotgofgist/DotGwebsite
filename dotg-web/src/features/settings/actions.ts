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

type SiteSettingsUpsert =
  Database["public"]["Tables"]["site_settings"]["Insert"];
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
  const validation = validateSiteSettingsFormData(formData);

  if (!validation.ok) return validation.state;

  const manager = await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const payload = {
    id: 1,
    name: validation.values.name,
    title: validation.values.title,
    description: validation.values.description,
    short_description: validation.values.shortDescription,
    updated_by: manager.id,
  } satisfies SiteSettingsUpsert;
  const { error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    return { status: "error", message: "사이트 설정을 저장하지 못했습니다." };
  }

  revalidateSettingsPaths();
  redirect("/admin/settings?saved=settings");
}

export async function createContactItemAction(
  _previousState: ContactItemActionState,
  formData: FormData,
): Promise<ContactItemActionState> {
  const validation = validateContactItemFormData(formData);

  if (!validation.ok) return validation.state;

  await requireContentManager();
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
    return { status: "error", message: "연락처를 생성하지 못했습니다." };
  }

  revalidateSettingsPaths();
  redirect(`/admin/settings/contacts/${data.id}/edit?created=1`);
}

export async function updateContactItemAction(
  _previousState: ContactItemActionState,
  formData: FormData,
): Promise<ContactItemActionState> {
  const validation = validateContactItemFormData(formData);

  if (!validation.ok) return validation.state;

  if (!validation.values.id) {
    return { status: "error", message: "연락처 id가 없습니다." };
  }

  await requireContentManager();
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
    return { status: "error", message: "연락처를 저장하지 못했습니다." };
  }

  revalidateSettingsPaths();
  redirect(`/admin/settings/contacts/${validation.values.id}/edit?saved=1`);
}

export async function deleteContactItemAction(formData: FormData): Promise<never> {
  const id = formData.get("id");

  if (typeof id !== "string" || !uuidPattern.test(id)) {
    redirect("/admin/settings?error=contact-delete");
  }

  await requireContentManager();
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
  const validation = validateSocialLinkFormData(formData);

  if (!validation.ok) return validation.state;

  await requireContentManager();
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
    return { status: "error", message: "SNS 링크를 생성하지 못했습니다." };
  }

  revalidateSettingsPaths();
  redirect(`/admin/settings/social-links/${data.id}/edit?created=1`);
}

export async function updateSocialLinkAction(
  _previousState: SocialLinkActionState,
  formData: FormData,
): Promise<SocialLinkActionState> {
  const validation = validateSocialLinkFormData(formData);

  if (!validation.ok) return validation.state;

  if (!validation.values.id) {
    return { status: "error", message: "SNS 링크 id가 없습니다." };
  }

  await requireContentManager();
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
    return { status: "error", message: "SNS 링크를 저장하지 못했습니다." };
  }

  revalidateSettingsPaths();
  redirect(`/admin/settings/social-links/${validation.values.id}/edit?saved=1`);
}

export async function deleteSocialLinkAction(formData: FormData): Promise<never> {
  const id = formData.get("id");

  if (typeof id !== "string" || !uuidPattern.test(id)) {
    redirect("/admin/settings?error=social-delete");
  }

  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id);

  if (error) {
    redirect(`/admin/settings/social-links/${id}/edit?error=delete`);
  }

  revalidateSettingsPaths();
  redirect("/admin/settings?deleted=social");
}
