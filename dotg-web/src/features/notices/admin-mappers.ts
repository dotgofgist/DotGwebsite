import type { Database } from "@/lib/supabase/database.types";
import type { AdminNotice } from "./types";

type NoticeRow = Database["public"]["Tables"]["notices"]["Row"];

export function mapNoticeRowToAdminNotice(row: NoticeRow): AdminNotice {
  const publishedAt = row.published_at ?? row.created_at;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    pinned: row.pinned,
    publicationStatus: row.publication_status,
    publishedAt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
