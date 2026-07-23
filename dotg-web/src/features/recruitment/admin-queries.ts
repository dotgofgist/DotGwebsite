import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapRecruitmentRowToAdminRecruitment } from "./admin-mappers";
import type { AdminRecruitment } from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

const listColumns = `
  id,
  title,
  summary,
  status,
  publication_status,
  is_current,
  target,
  qualifications,
  activities,
  starts_at,
  ends_at,
  application_url,
  application_label,
  contact_label,
  contact_value,
  contact_href,
  published_at,
  created_at,
  updated_at
`;

const detailColumns = `
  ${listColumns},
  recruitment_steps (
    id,
    recruitment_id,
    title,
    description,
    sort_order,
    created_at,
    updated_at
  )
`;

export async function getAllAdminRecruitments(): Promise<AdminRecruitment[]> {
  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("recruitments")
    .select(listColumns)
    .order("is_current", { ascending: false })
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("관리자 모집 정보를 불러오지 못했습니다.");
  }

  return data.map((row) => mapRecruitmentRowToAdminRecruitment(row));
}

export async function getAdminRecruitmentById(
  id: string,
): Promise<AdminRecruitment | undefined> {
  await requireContentManager();

  if (!uuidPattern.test(id)) {
    return undefined;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("recruitments")
    .select(detailColumns)
    .eq("id", id)
    .order("sort_order", {
      referencedTable: "recruitment_steps",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new Error("관리자 모집 정보를 불러오지 못했습니다.");
  }

  return data ? mapRecruitmentRowToAdminRecruitment(data) : undefined;
}

export async function getCurrentAdminRecruitment(): Promise<
  AdminRecruitment | undefined
> {
  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("recruitments")
    .select(detailColumns)
    .eq("is_current", true)
    .order("sort_order", {
      referencedTable: "recruitment_steps",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new Error("현재 모집 정보를 불러오지 못했습니다.");
  }

  return data ? mapRecruitmentRowToAdminRecruitment(data) : undefined;
}
