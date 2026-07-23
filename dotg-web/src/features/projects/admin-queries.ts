import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { PROJECT_IMAGES_BUCKET } from "@/lib/supabase/storage-constants";
import { requireContentManager } from "@/features/auth/server";
import {
  mapProjectRowToAdminProject,
  type AdminProjectRowWithRelations,
} from "./admin-mappers";
import type { AdminProject } from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

export async function getAllAdminProjects(): Promise<AdminProject[]> {
  await requireContentManager();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectListColumns)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("관리자 프로젝트 목록을 불러오지 못했습니다.");
  }

  return data.map((row) =>
    mapProjectRowToAdminProject(
      row,
      getPublicStorageUrl(supabase, PROJECT_IMAGES_BUCKET, row.thumbnail_path),
    ),
  );
}

export async function getAdminProjectById(
  id: string,
): Promise<AdminProject | undefined> {
  await requireContentManager();

  if (!isUuid(id)) {
    return undefined;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectDetailColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("관리자 프로젝트 상세를 불러오지 못했습니다.");
  }

  return data
    ? mapProjectRowToAdminProject(
        data as AdminProjectRowWithRelations,
        getPublicStorageUrl(supabase, PROJECT_IMAGES_BUCKET, data.thumbnail_path),
      )
    : undefined;
}

export async function getRecentAdminProjects(
  limit = 3,
): Promise<AdminProject[]> {
  const projects = await getAllAdminProjects();

  return projects.slice(0, limit);
}
