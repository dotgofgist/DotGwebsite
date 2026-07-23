import type { Database } from "@/lib/supabase/database.types";
import type {
  AdminContactItem,
  AdminSiteSettings,
  AdminSocialLink,
  ContactItem,
  SiteSettings,
  SocialLink,
} from "./types";

type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
type ContactItemRow = Database["public"]["Tables"]["contact_items"]["Row"];
type SocialLinkRow = Database["public"]["Tables"]["social_links"]["Row"];

export function mapSiteSettingsRowToSettings(
  row: SiteSettingsRow,
): SiteSettings {
  return {
    name: row.name,
    title: row.title,
    description: row.description,
    shortDescription: row.short_description,
  };
}

export function mapSiteSettingsRowToAdminSettings(
  row: SiteSettingsRow,
): AdminSiteSettings {
  return {
    ...mapSiteSettingsRowToSettings(row),
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContactItemRowToContactItem(
  row: ContactItemRow,
): ContactItem {
  return {
    label: row.label,
    value: row.value,
    href: row.href ?? undefined,
    description: row.description ?? undefined,
  };
}

export function mapContactItemRowToAdminContactItem(
  row: ContactItemRow,
): AdminContactItem {
  return {
    ...mapContactItemRowToContactItem(row),
    id: row.id,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSocialLinkRowToSocialLink(row: SocialLinkRow): SocialLink {
  return {
    name: row.platform,
    label: row.label,
    href: row.url ?? "#",
    description: row.description ?? undefined,
  };
}

export function mapSocialLinkRowToAdminSocialLink(
  row: SocialLinkRow,
): AdminSocialLink {
  return {
    id: row.id,
    platform: row.platform,
    label: row.label,
    url: row.url ?? undefined,
    description: row.description ?? undefined,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
