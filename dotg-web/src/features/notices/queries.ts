import { notices } from "./mock-data";
import type { Notice } from "./types";

// TODO: Supabase 스키마 및 Repository 구현 후 mock data를 실제 조회로 교체
function compareNoticeDate(a: Notice, b: Notice): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

export function getAllNotices(): Notice[] {
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

export function getLatestNotices(limit?: number): Notice[] {
  const latestNotices = [...notices].sort(compareNoticeDate);

  if (typeof limit === "number") {
    return latestNotices.slice(0, limit);
  }

  return latestNotices;
}

export function getNoticeBySlug(slug: string): Notice | undefined {
  return notices.find((notice) => notice.slug === slug);
}

export function getPinnedNotices(): Notice[] {
  return getAllNotices().filter((notice) => notice.pinned);
}
