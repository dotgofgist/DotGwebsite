"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContentManager } from "@/features/auth/server";
import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NoticeActionState, NoticeFormValues } from "./validation";
import { validateNoticeFormData } from "./validation";

type NoticeInsert = Database["public"]["Tables"]["notices"]["Insert"];
type NoticeUpdate = Database["public"]["Tables"]["notices"]["Update"];

function buildNoticePayload(
  values: NoticeFormValues,
  userId: string,
  existingPublishedAt?: string | null,
): NoticeInsert {
  const publishedAt =
    values.publicationStatus === "published"
      ? existingPublishedAt ?? new Date().toISOString()
      : existingPublishedAt ?? null;

  return {
    title: values.title,
    slug: values.slug,
    summary: values.summary,
    content: values.content,
    pinned: values.pinned,
    publication_status: values.publicationStatus,
    published_at: publishedAt,
    updated_by: userId,
  };
}

function revalidateNoticePaths(slug?: string, oldSlug?: string): void {
  revalidatePath("/");
  revalidatePath("/notices");
  revalidatePath("/admin");
  revalidatePath("/admin/notices");

  if (slug) revalidatePath(`/notices/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/notices/${oldSlug}`);
}

export async function createNoticeAction(
  _previousState: NoticeActionState,
  formData: FormData,
): Promise<NoticeActionState> {
  const manager = await requireContentManager();
  const validation = validateNoticeFormData(formData);

  if (!validation.ok) return validation.state;

  const supabase = await createServerSupabaseClient();
  const payload = {
    ...buildNoticePayload(validation.values, manager.id),
    created_by: manager.id,
  } satisfies NoticeInsert;
  const { data, error } = await supabase
    .from("notices")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "이미 사용 중인 slug입니다."
          : "공지사항을 생성하지 못했습니다.",
      fieldErrors: error.code === "23505" ? { slug: "이미 사용 중인 slug입니다." } : undefined,
    };
  }

  revalidateNoticePaths(data.slug);
  redirect(`/admin/notices/${data.id}/edit?created=1`);
}

export async function updateNoticeAction(
  _previousState: NoticeActionState,
  formData: FormData,
): Promise<NoticeActionState> {
  const manager = await requireContentManager();
  const validation = validateNoticeFormData(formData);

  if (!validation.ok) return validation.state;

  const supabase = await createServerSupabaseClient();
  const id = validation.values.id;

  if (!id) {
    return { status: "error", message: "공지사항 id가 없습니다." };
  }

  const existing = await supabase
    .from("notices")
    .select("id, slug, published_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (existing.error) {
    return { status: "error", message: "공지사항을 불러오지 못했습니다." };
  }

  if (!existing.data) {
    return { status: "error", message: "공지사항을 찾을 수 없습니다." };
  }

  const { data, error } = await supabase
    .from("notices")
    .update(
      buildNoticePayload(
        validation.values,
        manager.id,
        existing.data.published_at,
      ) satisfies NoticeUpdate,
    )
    .eq("id", id)
    .eq("updated_at", validation.values.updatedAt ?? "")
    .select("id, slug")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "이미 사용 중인 slug입니다."
          : "공지사항을 저장하지 못했습니다.",
      fieldErrors: error.code === "23505" ? { slug: "이미 사용 중인 slug입니다." } : undefined,
    };
  }

  if (!data) {
    return {
      status: "error",
      message: "Another admin saved this notice first. Refresh and try again.",
    };
  }

  revalidateNoticePaths(data.slug, existing.data.slug);
  redirect(`/admin/notices/${data.id}/edit?saved=1`);
}

export async function deleteNoticeAction(formData: FormData): Promise<never> {
  await requireContentManager();
  const id = formData.get("id");
  const slug = formData.get("slug");

  if (typeof id !== "string") {
    redirect("/admin/notices?error=delete");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) {
    redirect(`/admin/notices/${id}/edit?error=delete`);
  }

  revalidateNoticePaths(typeof slug === "string" ? slug : undefined);
  redirect("/admin/notices?deleted=1");
}
