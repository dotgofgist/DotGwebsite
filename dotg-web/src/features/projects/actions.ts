"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  isValidProjectThumbnailPath,
  removeStorageObject,
  warnStorageIntegrity,
} from "@/lib/supabase/storage";
import { PROJECT_IMAGES_BUCKET } from "@/lib/supabase/storage-constants";
import type { ProjectActionState, ProjectFormValues } from "./validation";
import { validateProjectFormData } from "./validation";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
type ProjectMemberInsert =
  Database["public"]["Tables"]["project_members"]["Insert"];
type ProjectLinkInsert = Database["public"]["Tables"]["project_links"]["Insert"];

function buildProjectPayload(
  values: ProjectFormValues,
  userId: string,
  existingPublishedAt?: string | null,
): ProjectInsert {
  const publishedAt =
    values.publicationStatus === "published"
      ? existingPublishedAt ?? new Date().toISOString()
      : existingPublishedAt ?? null;

  return {
    title: values.title,
    slug: values.slug,
    summary: values.summary,
    description: values.description,
    status: values.status,
    publication_status: values.publicationStatus,
    tags: values.tags,
    featured: values.featured,
    started_at: values.startedAt ?? null,
    released_at: values.releasedAt ?? null,
    published_at: publishedAt,
    sort_order: values.sortOrder,
    updated_by: userId,
  };
}

function revalidateProjectPaths(slug?: string, oldSlug?: string): void {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");

  if (slug) revalidatePath(`/projects/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/projects/${oldSlug}`);
}

function relationRows(
  projectId: string,
  values: ProjectFormValues,
): {
  members: ProjectMemberInsert[];
  links: ProjectLinkInsert[];
} {
  return {
    members: values.members.map((member) => ({
      project_id: projectId,
      name: member.name,
      role: member.role,
      sort_order: member.sortOrder,
    })),
    links: values.links.map((link) => ({
      project_id: projectId,
      link_type: link.type,
      label: link.label,
      url: link.href,
      sort_order: link.sortOrder,
    })),
  };
}

async function replaceRelations(
  projectId: string,
  values: ProjectFormValues,
): Promise<ProjectActionState | null> {
  const supabase = await createServerSupabaseClient();
  const { members, links } = relationRows(projectId, values);
  const deleteMembers = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId);

  if (deleteMembers.error) {
    return { status: "error", message: "프로젝트 멤버 저장 중 문제가 발생했습니다." };
  }

  const deleteLinks = await supabase
    .from("project_links")
    .delete()
    .eq("project_id", projectId);

  if (deleteLinks.error) {
    return { status: "error", message: "프로젝트 링크 저장 중 문제가 발생했습니다." };
  }

  if (members.length > 0) {
    const result = await supabase.from("project_members").insert(members);

    if (result.error) {
      return { status: "error", message: "프로젝트 멤버 저장 중 문제가 발생했습니다." };
    }
  }

  if (links.length > 0) {
    const result = await supabase.from("project_links").insert(links);

    if (result.error) {
      return { status: "error", message: "프로젝트 링크 저장 중 문제가 발생했습니다." };
    }
  }

  return null;
}

export async function createProjectAction(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const manager = await requireContentManager();
  const validation = validateProjectFormData(formData);

  if (!validation.ok) return validation.state;

  const supabase = await createServerSupabaseClient();
  const payload = {
    ...buildProjectPayload(validation.values, manager.id),
    created_by: manager.id,
  } satisfies ProjectInsert;
  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "이미 사용 중인 slug입니다."
          : "프로젝트를 생성하지 못했습니다.",
      fieldErrors: error.code === "23505" ? { slug: "이미 사용 중인 slug입니다." } : undefined,
    };
  }

  const relationError = await replaceRelations(data.id, validation.values);

  if (relationError) return relationError;

  revalidateProjectPaths(data.slug);
  redirect(`/admin/projects/${data.id}/edit?created=1`);
}

export async function updateProjectAction(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const manager = await requireContentManager();
  const validation = validateProjectFormData(formData);

  if (!validation.ok) return validation.state;

  const supabase = await createServerSupabaseClient();
  const id = validation.values.id;

  if (!id) {
    return { status: "error", message: "프로젝트 id가 없습니다." };
  }

  const existing = await supabase
    .from("projects")
    .select("id, slug, published_at")
    .eq("id", id)
    .maybeSingle();

  if (existing.error) {
    return { status: "error", message: "프로젝트를 불러오지 못했습니다." };
  }

  if (!existing.data) {
    return { status: "error", message: "프로젝트를 찾을 수 없습니다." };
  }

  const { data, error } = await supabase
    .from("projects")
    .update(
      buildProjectPayload(
        validation.values,
        manager.id,
        existing.data.published_at,
      ) satisfies ProjectUpdate,
    )
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "이미 사용 중인 slug입니다."
          : "프로젝트를 저장하지 못했습니다.",
      fieldErrors: error.code === "23505" ? { slug: "이미 사용 중인 slug입니다." } : undefined,
    };
  }

  const relationError = await replaceRelations(data.id, validation.values);

  if (relationError) return relationError;

  revalidateProjectPaths(data.slug, existing.data.slug);
  redirect(`/admin/projects/${data.id}/edit?saved=1`);
}

export async function deleteProjectAction(formData: FormData): Promise<never> {
  const manager = await requireContentManager();
  const id = formData.get("id");
  const slug = formData.get("slug");

  if (typeof id !== "string") {
    redirect("/admin/projects?error=delete");
  }

  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("projects")
    .select("id, thumbnail_path")
    .eq("id", id)
    .maybeSingle();

  if (existing.error) {
    redirect(`/admin/projects/${id}/edit?error=delete`);
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    redirect(`/admin/projects/${id}/edit?error=delete`);
  }

  if (isValidProjectThumbnailPath(id, existing.data?.thumbnail_path)) {
    await removeStorageObject(
      supabase,
      PROJECT_IMAGES_BUCKET,
      existing.data?.thumbnail_path,
    );
  } else if (existing.data?.thumbnail_path) {
    warnStorageIntegrity(
      "Project delete skipped thumbnail removal because the path is outside the project prefix.",
      {
        bucket: PROJECT_IMAGES_BUCKET,
        path: existing.data.thumbnail_path,
        projectId: id,
      },
    );
  }

  void manager;
  revalidateProjectPaths(typeof slug === "string" ? slug : undefined);
  redirect("/admin/projects?deleted=1");
}
