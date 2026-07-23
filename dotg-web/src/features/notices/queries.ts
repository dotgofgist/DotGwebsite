import { isSupabaseConfigured } from "@/lib/supabase/env";
import { notices } from "./mock-data";
import type { Notice } from "./types";

function ensureGeneratedDatabaseTypes(scope: string): void {
  if (isSupabaseConfigured()) {
    throw new Error(
      `${scope} Supabase 조회를 위해 src/lib/supabase/database.types.ts 생성이 필요합니다.`,
    );
  }
}

function compareNoticeDate(a: Notice, b: Notice): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

export async function getAllNotices(): Promise<Notice[]> {
  ensureGeneratedDatabaseTypes("공개 공지사항 목록");

  return notices
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

export async function getLatestNotices(limit?: number): Promise<Notice[]> {
  ensureGeneratedDatabaseTypes("최신 공지사항");

  const latestNotices = [...notices].sort(compareNoticeDate);

  if (typeof limit === "number") {
    return latestNotices.slice(0, limit);
  }

  return latestNotices;
}

export async function getNoticeBySlug(
  slug: string,
): Promise<Notice | undefined> {
  ensureGeneratedDatabaseTypes("공개 공지사항 상세");

  return notices.find((notice) => notice.slug === slug);
}

export async function getPinnedNotices(): Promise<Notice[]> {
  const allNotices = await getAllNotices();

  return allNotices.filter((notice) => notice.pinned);
}
