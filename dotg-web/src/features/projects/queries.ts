import { shouldUsePublicMockFallback } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { PROJECT_IMAGES_BUCKET } from "@/lib/supabase/storage-constants";
import {
  mapProjectRowToAdminProject,
  type AdminProjectRowWithRelations,
} from "./admin-mappers";
import { projects } from "./mock-data";
import type { Project, ProjectStatus } from "./types";

const statusOrder: Record<ProjectStatus, number> = {
  developing: 1,
  planning: 2,
  released: 3,
  archived: 4,
};

const projectListColumns = `
  id,
  slug,
  title,
  summary,
  description,
  thumbnail_path,
  status,
  publication_status,
  tags,
  featured,
  started_at,
  released_at,
  published_at,
  sort_order,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

const projectDetailColumns = `
  ${projectListColumns},
  project_members (
    id,
    name,
    role,
    sort_order,
    project_id,
    created_at,
    updated_at
  ),
  project_links (
    id,
    link_type,
    label,
    url,
    sort_order,
    project_id,
    created_at,
    updated_at
  )
`;

function sortProjects(projectList: Project[]): Project[] {
  return [...projectList].sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }

    const statusDifference = statusOrder[a.status] - statusOrder[b.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

function withThumbnailUrl(
  project: Project,
  thumbnailUrl: string | undefined,
): Project {
  return thumbnailUrl ? { ...project, thumbnailUrl } : project;
}

export async function getAllProjects(): Promise<Project[]> {
  if (shouldUsePublicMockFallback("public projects")) {
    return sortProjects(projects);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectListColumns)
    .eq("publication_status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error("공개 프로젝트 목록을 불러오지 못했습니다.");
  }

  return data.map((row) =>
    withThumbnailUrl(
      mapProjectRowToAdminProject(row),
      getPublicStorageUrl(supabase, PROJECT_IMAGES_BUCKET, row.thumbnail_path),
    ),
  );
}

export async function getFeaturedProjects(limit?: number): Promise<Project[]> {
  const featuredProjects = (await getAllProjects()).filter(
    (project) => project.featured,
  );

  if (typeof limit === "number") {
    return featuredProjects.slice(0, limit);
  }

  return featuredProjects;
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  if (shouldUsePublicMockFallback("public project detail")) {
    return projects.find((project) => project.slug === slug);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectDetailColumns)
    .eq("slug", slug)
    .eq("publication_status", "published")
    .maybeSingle();

  if (error) {
    throw new Error("공개 프로젝트 상세를 불러오지 못했습니다.");
  }

  return data
    ? withThumbnailUrl(
        mapProjectRowToAdminProject(data as AdminProjectRowWithRelations),
        getPublicStorageUrl(supabase, PROJECT_IMAGES_BUCKET, data.thumbnail_path),
      )
    : undefined;
}

export async function getProjectsByStatus(
  status: ProjectStatus,
): Promise<Project[]> {
  return (await getAllProjects()).filter((project) => project.status === status);
}
