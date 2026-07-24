import { shouldUsePublicMockFallback } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapRecruitmentRowToRecruitment } from "./admin-mappers";
import type { Recruitment } from "./types";

export async function getCurrentRecruitment(): Promise<Recruitment | null> {
  if (shouldUsePublicMockFallback("public recruitment")) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("recruitments")
    .select(
      `
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
        updated_at,
        recruitment_steps (
          id,
          recruitment_id,
          title,
          description,
          sort_order,
          created_at,
          updated_at
        )
      `,
    )
    .eq("is_current", true)
    .eq("publication_status", "published")
    .order("sort_order", {
      referencedTable: "recruitment_steps",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new Error("모집 정보를 불러오지 못했습니다.");
  }

  return data ? mapRecruitmentRowToRecruitment(data) : null;
}

export function isRecruitmentOpen(
  recruitmentInfo: Recruitment,
  now: Date = new Date(),
): boolean {
  if (
    recruitmentInfo.status !== "open" &&
    recruitmentInfo.status !== "always"
  ) {
    return false;
  }

  if (recruitmentInfo.status === "always") {
    return true;
  }

  if (recruitmentInfo.schedule.endsAt) {
    const endsAt = new Date(recruitmentInfo.schedule.endsAt);

    if (!Number.isNaN(endsAt.getTime()) && endsAt < now) {
      return false;
    }
  }

  return true;
}
