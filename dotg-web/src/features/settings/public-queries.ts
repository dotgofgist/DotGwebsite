import { contactItems } from "@/config/contact";
import { siteConfig } from "@/config/site";
import { socialLinks } from "@/config/social";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function ensureGeneratedDatabaseTypes(scope: string): void {
  if (isSupabaseConfigured()) {
    throw new Error(
      `${scope} Supabase 조회를 위해 src/lib/supabase/database.types.ts 생성이 필요합니다.`,
    );
  }
}

export async function getPublicSiteSettings() {
  ensureGeneratedDatabaseTypes("사이트 설정");

  return siteConfig;
}

export async function getPublicContactItems() {
  ensureGeneratedDatabaseTypes("연락처");

  return contactItems;
}

export async function getPublicSocialLinks() {
  ensureGeneratedDatabaseTypes("SNS 링크");

  return socialLinks;
}
