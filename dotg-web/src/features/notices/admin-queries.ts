import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapNoticeRowToAdminNotice } from "./admin-mappers";
import type { AdminNotice } from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const noticeListColumns = `
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

function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

export async function getAllAdminNotices(): Promise<AdminNotice[]> {
  await requireContentManager();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .select(noticeListColumns)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("관리자 공지사항 목록을 불러오지 못했습니다.");
  }

  return data.map((row) => mapNoticeRowToAdminNotice(row));
}

export async function getAdminNoticeById(
  id: string,
): Promise<AdminNotice | undefined> {
  await requireContentManager();

  if (!isUuid(id)) {
    return undefined;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .select(noticeListColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("관리자 공지사항 상세를 불러오지 못했습니다.");
  }

  return data ? mapNoticeRowToAdminNotice(data) : undefined;
}

export async function getRecentAdminNotices(
  limit = 3,
): Promise<AdminNotice[]> {
  const notices = await getAllAdminNotices();

  return notices.slice(0, limit);
}
