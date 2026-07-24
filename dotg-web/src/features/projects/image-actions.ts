"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createProjectThumbnailPath,
  isValidProjectThumbnailPath,
  removeStorageObject,
  warnStorageIntegrity,
} from "@/lib/supabase/storage";
import {
  PROJECT_IMAGES_BUCKET,
  PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
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

export async function updateProjectThumbnailAction(
  _previousState: ProjectImageActionState,
  formData: FormData,
): Promise<ProjectImageActionState> {
  await requireContentManager();
  const projectId = formData.get("projectId");

  if (typeof projectId !== "string" || !uuidPattern.test(projectId)) {
    return { status: "error", message: "Invalid project id." };
  }

  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("projects")
    .select("id, slug, thumbnail_path")
    .eq("id", projectId)
    .maybeSingle();

  if (existing.error) {
    return { status: "error", message: "Could not load project image state." };
  }

  if (!existing.data) {
    return { status: "error", message: "Project not found." };
  }

  const image = await validateImageFile(formData.get("image"), {
    fieldName: "Project thumbnail",
    maxBytes: PROJECT_THUMBNAIL_MAX_BYTES,
    dimensions: PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
  });

  if (!image.ok) {
    return { status: "error", message: image.message };
  }

  const nextPath = createProjectThumbnailPath(projectId, image.imageType.extension);
  const upload = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(nextPath, image.file, {
      cacheControl: "31536000",
      contentType: image.imageType.mimeType,
      upsert: false,
    });

  if (upload.error) {
    return { status: "error", message: "Could not upload the project image." };
  }

  const updateQuery = supabase
    .from("projects")
    .update({ thumbnail_path: nextPath })
    .eq("id", projectId);
  const update =
    existing.data.thumbnail_path === null
      ? await updateQuery.is("thumbnail_path", null).select("id").maybeSingle()
      : await updateQuery.eq("thumbnail_path", existing.data.thumbnail_path).select("id").maybeSingle();

  if (update.error || !update.data) {
    const rollback = await removeStorageObject(supabase, PROJECT_IMAGES_BUCKET, nextPath);
    if (!rollback.ok) {
      return {
        status: "error",
        message:
          "Image save failed and the uploaded object could not be cleaned up automatically.",
      };
    }

    return {
      status: "error",
      message: update.error
        ? "Could not save the project image."
        : "The project image changed while you were editing. Please retry.",
    };
  }

  if (isValidProjectThumbnailPath(projectId, existing.data.thumbnail_path)) {
    await removeStorageObject(supabase, PROJECT_IMAGES_BUCKET, existing.data.thumbnail_path);
  } else if (existing.data.thumbnail_path) {
    warnStorageIntegrity("Existing project thumbnail path was not removed because it is outside the project prefix.", {
      bucket: PROJECT_IMAGES_BUCKET,
      path: existing.data.thumbnail_path,
      projectId,
    });
  }

  revalidateProjectImagePaths(existing.data.slug);
  redirect(`/admin/projects/${projectId}/edit?image=uploaded`);
}

export async function removeProjectThumbnailAction(
  formData: FormData,
): Promise<never> {
  await requireContentManager();
  const projectId = formData.get("projectId");

  if (typeof projectId !== "string" || !uuidPattern.test(projectId)) {
    redirect("/admin/projects?error=image");
  }

  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("projects")
    .select("id, slug, thumbnail_path")
    .eq("id", projectId)
    .maybeSingle();

  if (existing.error || !existing.data) {
    redirect(`/admin/projects/${projectId}/edit?error=image`);
  }

  if (!existing.data.thumbnail_path) {
    revalidateProjectImagePaths(existing.data.slug);
    redirect(`/admin/projects/${projectId}/edit?image=removed`);
  }

  const update = await supabase
    .from("projects")
    .update({ thumbnail_path: null })
    .eq("id", projectId)
    .eq("thumbnail_path", existing.data.thumbnail_path)
    .select("id")
    .maybeSingle();

  if (update.error || !update.data) {
    redirect(`/admin/projects/${projectId}/edit?error=image`);
  }

  if (isValidProjectThumbnailPath(projectId, existing.data.thumbnail_path)) {
    await removeStorageObject(supabase, PROJECT_IMAGES_BUCKET, existing.data.thumbnail_path);
  } else {
    warnStorageIntegrity("Cleared invalid project thumbnail path without deleting storage object.", {
      bucket: PROJECT_IMAGES_BUCKET,
      path: existing.data.thumbnail_path,
      projectId,
    });
  }

  revalidateProjectImagePaths(existing.data.slug);
  redirect(`/admin/projects/${projectId}/edit?image=removed`);
}
