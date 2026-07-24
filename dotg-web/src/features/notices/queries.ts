import { shouldUsePublicMockFallback } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapNoticeRowToAdminNotice } from "./admin-mappers";
import { notices } from "./mock-data";
import type { Notice } from "./types";

const publicNoticeColumns = `
  id,
  slug,
  title,
  summary,
  content,
  pinned,
  publication_status,
  published_at,
  created_at,
  updated_at,
  created_by,
  updated_by
`;

function compareNoticeDate(a: Notice, b: Notice): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

function sortFallbackNotices(fallbackNotices: Notice[]): Notice[] {
  return fallbackNotices
    .map((notice, index) => ({ notice, index }))
    .sort((a, b) => {
      if (a.notice.pinned !== b.notice.pinned) {
        return a.notice.pinned ? -1 : 1;
      }

      const dateDifference = compareNoticeDate(a.notice, b.notice);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return a.index - b.index;
    })
    .map(({ notice }) => notice);
}

export async function getAllNotices(): Promise<Notice[]> {
  if (shouldUsePublicMockFallback("public notices")) {
    return sortFallbackNotices(notices);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .select(publicNoticeColumns)
    .eq("publication_status", "published")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load public notices from Supabase.");
  }

  return data.map((row) => mapNoticeRowToAdminNotice(row));
}

export async function getLatestNotices(limit?: number): Promise<Notice[]> {
  const latestNotices = [...(await getAllNotices())].sort(compareNoticeDate);

  if (typeof limit === "number") {
    return latestNotices.slice(0, limit);
  }

  return latestNotices;
}

export async function getNoticeBySlug(
  slug: string,
): Promise<Notice | undefined> {
  if (shouldUsePublicMockFallback("public notice detail")) {
    return notices.find((notice) => notice.slug === slug);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .select(publicNoticeColumns)
    .eq("slug", slug)
    .eq("publication_status", "published")
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load public notice detail from Supabase.");
  }

  return data ? mapNoticeRowToAdminNotice(data) : undefined;
}

export async function getPinnedNotices(): Promise<Notice[]> {
  const allNotices = await getAllNotices();

  return allNotices.filter((notice) => notice.pinned);
}
