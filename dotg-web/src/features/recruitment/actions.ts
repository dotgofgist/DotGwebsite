"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import type { RecruitmentActionState, RecruitmentFormValues } from "./validation";
import { uuidPattern, validateRecruitmentFormData } from "./validation";

function revalidateRecruitmentPaths(id?: string): void {
  revalidatePath("/");
  revalidatePath("/recruitment");
  revalidatePath("/admin");
  revalidatePath("/admin/recruitment");

  if (id) {
    revalidatePath(`/admin/recruitment/${id}/edit`);
  }
}

function buildStepsJson(values: RecruitmentFormValues): Json {
  return values.process.map((step) => ({
    title: step.title,
    description: step.description,
    sortOrder: step.sortOrder,
  }));
}

async function saveRecruitment(values: RecruitmentFormValues): Promise<{
  id?: string;
  state?: RecruitmentActionState;
}> {
  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const sharedArgs = {
    p_title: values.title,
    p_summary: values.summary,
    p_status: values.status,
    p_publication_status: values.publicationStatus,
    p_target: values.target,
    p_qualifications: values.qualifications,
    p_activities: values.activities,
    p_starts_at: values.startsAt ?? "",
    p_ends_at: values.endsAt ?? "",
    p_application_url: values.applicationUrl ?? "",
    p_application_label: values.applicationLabel,
    p_contact_label: values.contactLabel ?? "",
    p_contact_value: values.contactValue ?? "",
    p_contact_href: values.contactHref ?? "",
    p_steps: buildStepsJson(values),
  };
  const { data, error } = values.id
    ? await supabase.rpc("save_recruitment", {
        p_id: values.id,
        ...sharedArgs,
      })
    : await supabase.rpc("create_recruitment", sharedArgs);

  if (error) {
    return {
      state: {
        status: "error",
        message:
          error.code === "23514"
            ? "모집 일정 또는 현재 모집 상태를 확인해 주세요."
            : "모집 정보를 저장하지 못했습니다.",
      },
    };
  }

  return { id: data };
}

export async function createRecruitmentAction(
  _previousState: RecruitmentActionState,
  formData: FormData,
): Promise<RecruitmentActionState> {
  await requireContentManager();
  const validation = validateRecruitmentFormData(formData);

  if (!validation.ok) return validation.state;

  const result = await saveRecruitment(validation.values);

  if (result.state) return result.state;

  revalidateRecruitmentPaths(result.id);
  redirect(`/admin/recruitment/${result.id}/edit?created=1`);
}

export async function updateRecruitmentAction(
  _previousState: RecruitmentActionState,
  formData: FormData,
): Promise<RecruitmentActionState> {
  await requireContentManager();
  const validation = validateRecruitmentFormData(formData);

  if (!validation.ok) return validation.state;

  if (!validation.values.id) {
    return { status: "error", message: "모집 정보 id가 없습니다." };
  }

  const result = await saveRecruitment(validation.values);

  if (result.state) return result.state;

  revalidateRecruitmentPaths(result.id);
  redirect(`/admin/recruitment/${result.id}/edit?saved=1`);
}

export async function setCurrentRecruitmentAction(
  formData: FormData,
): Promise<never> {
  await requireContentManager();
  const id = formData.get("id");

  if (typeof id !== "string" || !uuidPattern.test(id)) {
    redirect("/admin/recruitment?error=current");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("set_current_recruitment", { p_id: id });

  if (error) {
    redirect(`/admin/recruitment?error=${error.code === "23514" ? "archived-current" : "current"}`);
  }

  revalidateRecruitmentPaths(id);
  redirect("/admin/recruitment?current=1");
}

export async function unsetCurrentRecruitmentAction(
  formData: FormData,
): Promise<never> {
  await requireContentManager();
  const id = formData.get("id");

  if (typeof id !== "string" || !uuidPattern.test(id)) {
    redirect("/admin/recruitment?error=current");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("unset_current_recruitment", { p_id: id });

  if (error) {
    redirect("/admin/recruitment?error=current");
  }

  revalidateRecruitmentPaths(id);
  redirect("/admin/recruitment?unset=1");
}

export async function archiveRecruitmentAction(
  formData: FormData,
): Promise<never> {
  const manager = await requireContentManager();
  const id = formData.get("id");

  if (typeof id !== "string" || !uuidPattern.test(id)) {
    redirect("/admin/recruitment?error=archive");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("recruitments")
    .update({
      publication_status: "archived",
      is_current: false,
      updated_by: manager.id,
    })
    .eq("id", id);

  if (error) {
    redirect("/admin/recruitment?error=archive");
  }

  revalidateRecruitmentPaths(id);
  redirect("/admin/recruitment?archived=1");
}
