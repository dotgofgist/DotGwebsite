import type { Database } from "@/lib/supabase/database.types";
import type { AdminRecruitment, Recruitment } from "./types";

type RecruitmentRow = Database["public"]["Tables"]["recruitments"]["Row"];
type RecruitmentStepRow =
  Database["public"]["Tables"]["recruitment_steps"]["Row"];

type SelectedRecruitmentRow = Pick<
  RecruitmentRow,
  | "activities"
  | "application_label"
  | "application_url"
  | "contact_href"
  | "contact_label"
  | "contact_value"
  | "created_at"
  | "ends_at"
  | "id"
  | "is_current"
  | "publication_status"
  | "published_at"
  | "qualifications"
  | "starts_at"
  | "status"
  | "summary"
  | "target"
  | "title"
  | "updated_at"
>;

type SelectedRecruitmentStepRow = Pick<
  RecruitmentStepRow,
  "description" | "sort_order" | "title"
>;

export type RecruitmentRowWithSteps = SelectedRecruitmentRow & {
  recruitment_steps?: SelectedRecruitmentStepRow[] | null;
};

function mapBaseRecruitment(row: RecruitmentRowWithSteps): Recruitment {
  const contact =
    row.contact_label || row.contact_value
      ? {
          label: row.contact_label ?? "문의",
          value: row.contact_value ?? "",
          href: row.contact_href ?? undefined,
        }
      : undefined;
  const process = [...(row.recruitment_steps ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((step) => ({
      title: step.title,
      description: step.description,
    }));

  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    target: row.target,
    qualifications: row.qualifications,
    activities: row.activities,
    schedule: {
      startsAt: row.starts_at ?? undefined,
      endsAt: row.ends_at ?? undefined,
    },
    process,
    applicationUrl: row.application_url ?? undefined,
    applicationLabel: row.application_label,
    contact,
    updatedAt: row.updated_at,
  };
}

export function mapRecruitmentRowToRecruitment(
  row: RecruitmentRowWithSteps,
): Recruitment {
  return mapBaseRecruitment(row);
}

export function mapRecruitmentRowToAdminRecruitment(
  row: RecruitmentRowWithSteps,
): AdminRecruitment {
  return {
    ...mapBaseRecruitment(row),
    publicationStatus: row.publication_status,
    isCurrent: row.is_current,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at,
    stepCount: row.recruitment_steps?.length,
  };
}
