import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mapContactItemRowToAdminContactItem,
  mapSiteSettingsRowToAdminSettings,
  mapSocialLinkRowToAdminSocialLink,
} from "./admin-mappers";
import type {
  AdminContactItem,
  AdminSiteSettings,
  AdminSocialLink,
} from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export async function getAdminSiteSettings(): Promise<
  AdminSiteSettings | undefined
> {
  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("id, name, title, description, short_description, updated_by, created_at, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("사이트 설정을 불러오지 못했습니다.");
  }

  return data ? mapSiteSettingsRowToAdminSettings(data) : undefined;
}

export async function getAllAdminContactItems(): Promise<AdminContactItem[]> {
  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_items")
    .select("id, label, value, href, description, is_active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("연락처 목록을 불러오지 못했습니다.");
  }

  return data.map((row) => mapContactItemRowToAdminContactItem(row));
}

export async function getAdminContactItemById(
  id: string,
): Promise<AdminContactItem | undefined> {
  await requireContentManager();

  if (!uuidPattern.test(id)) {
    return undefined;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_items")
    .select("id, label, value, href, description, is_active, sort_order, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("연락처를 불러오지 못했습니다.");
  }

  return data ? mapContactItemRowToAdminContactItem(data) : undefined;
}

export async function getAllAdminSocialLinks(): Promise<AdminSocialLink[]> {
  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, label, url, description, is_active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("SNS 링크 목록을 불러오지 못했습니다.");
  }

  return data.map((row) => mapSocialLinkRowToAdminSocialLink(row));
}

export async function getAdminSocialLinkById(
  id: string,
): Promise<AdminSocialLink | undefined> {
  await requireContentManager();

  if (!uuidPattern.test(id)) {
    return undefined;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, label, url, description, is_active, sort_order, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("SNS 링크를 불러오지 못했습니다.");
  }

  return data ? mapSocialLinkRowToAdminSocialLink(data) : undefined;
}
