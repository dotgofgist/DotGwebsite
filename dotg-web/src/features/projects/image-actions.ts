"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildStorageObjectPath } from "@/lib/supabase/storage";
import {
  PROJECT_IMAGES_BUCKET,
  PROJECT_THUMBNAIL_MAX_BYTES,
} from "@/lib/supabase/storage-constants";
import { validateImageFile } from "@/lib/supabase/storage-validation";

export type ProjectImageActionState = {
  status: "idle" | "error";
  message?: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function revalidateProjectImagePaths(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");

  if (slug) {
    revalidatePath(`/projects/${slug}`);
  }
}

async function removeStorageObject(path: string | null | undefined): Promise<void> {
  if (!path) return;

  const supabase = await createServerSupabaseClient();
  await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([path]);
}

export async function updateProjectThumbnailAction(
  _previousState: ProjectImageActionState,
  formData: FormData,
): Promise<ProjectImageActionState> {
  const projectId = formData.get("projectId");

  if (typeof projectId !== "string" || !uuidPattern.test(projectId)) {
    return { status: "error", message: "프로젝트 ID가 올바르지 않습니다." };
  }

  const image = await validateImageFile(formData.get("image"), {
    fieldName: "프로젝트 대표",
    maxBytes: PROJECT_THUMBNAIL_MAX_BYTES,
  });

  if (!image.ok) {
    return { status: "error", message: image.message };
  }

  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("projects")
    .select("id, slug, thumbnail_path")
    .eq("id", projectId)
    .maybeSingle();

  if (existing.error) {
    return { status: "error", message: "프로젝트 정보를 불러오지 못했습니다." };
  }

  if (!existing.data) {
    return { status: "error", message: "프로젝트를 찾을 수 없습니다." };
  }

  const nextPath = buildStorageObjectPath(
    [projectId, "thumbnail"],
    image.imageType.extension,
  );
  const upload = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(nextPath, image.file, {
      cacheControl: "31536000",
      contentType: image.imageType.mimeType,
      upsert: false,
    });

  if (upload.error) {
    return { status: "error", message: "프로젝트 이미지를 업로드하지 못했습니다." };
  }

  const update = await supabase
    .from("projects")
    .update({ thumbnail_path: nextPath })
    .eq("id", projectId);

  if (update.error) {
    await removeStorageObject(nextPath);
    return { status: "error", message: "프로젝트 이미지 정보를 저장하지 못했습니다." };
  }

  await removeStorageObject(existing.data.thumbnail_path);
  revalidateProjectImagePaths(existing.data.slug);
  redirect(`/admin/projects/${projectId}/edit?image=uploaded`);
}

export async function removeProjectThumbnailAction(
  formData: FormData,
): Promise<never> {
  const projectId = formData.get("projectId");

  if (typeof projectId !== "string" || !uuidPattern.test(projectId)) {
    redirect("/admin/projects?error=image");
  }

  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("projects")
    .select("id, slug, thumbnail_path")
    .eq("id", projectId)
    .maybeSingle();

  if (existing.error || !existing.data) {
    redirect(`/admin/projects/${projectId}/edit?error=image`);
  }

  const update = await supabase
    .from("projects")
    .update({ thumbnail_path: null })
    .eq("id", projectId);

  if (update.error) {
    redirect(`/admin/projects/${projectId}/edit?error=image`);
  }

  await removeStorageObject(existing.data.thumbnail_path);
  revalidateProjectImagePaths(existing.data.slug);
  redirect(`/admin/projects/${projectId}/edit?image=removed`);
}
