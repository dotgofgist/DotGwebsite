import { contactItems as configContactItems } from "@/config/contact";
import { siteConfig } from "@/config/site";
import { socialLinks as configSocialLinks } from "@/config/social";
import { shouldUsePublicMockFallback } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { SITE_ASSETS_BUCKET } from "@/lib/supabase/storage-constants";
import {
  mapContactItemRowToContactItem,
  mapSiteSettingsRowToSettings,
  mapSocialLinkRowToSocialLink,
} from "./admin-mappers";
import type { ContactItem, SiteSettings, SocialLink } from "./types";

function mapConfigSiteSettings(): SiteSettings {
  return {
    name: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    shortDescription: siteConfig.shortDescription,
  };
}

export async function getPublicSiteSettings(): Promise<SiteSettings> {
  if (shouldUsePublicMockFallback("public site settings")) {
    return mapConfigSiteSettings();
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("id, name, title, description, short_description, logo_path, hero_image_path, updated_by, created_at, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("사이트 설정을 불러오지 못했습니다.");
  }

  if (!data) {
    throw new Error("Site settings row is missing in Supabase.");
  }

  return {
    ...mapSiteSettingsRowToSettings(data),
    logoUrl: getPublicStorageUrl(supabase, SITE_ASSETS_BUCKET, data.logo_path),
    heroImageUrl: getPublicStorageUrl(
      supabase,
      SITE_ASSETS_BUCKET,
      data.hero_image_path,
    ),
  };
}

export async function getPublicContactItems(): Promise<ContactItem[]> {
  if (shouldUsePublicMockFallback("public contact items")) {
    return configContactItems;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_items")
    .select("id, label, value, href, description, is_active, sort_order, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("연락처를 불러오지 못했습니다.");
  }

  return data.map((row) => mapContactItemRowToContactItem(row));
}

export async function getPublicSocialLinks(): Promise<SocialLink[]> {
  if (shouldUsePublicMockFallback("public social links")) {
    return configSocialLinks;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("id, platform, label, url, description, is_active, sort_order, created_at, updated_at")
    .eq("is_active", true)
    .not("url", "is", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("SNS 링크를 불러오지 못했습니다.");
  }

  return data.map((row) => mapSocialLinkRowToSocialLink(row));
}
