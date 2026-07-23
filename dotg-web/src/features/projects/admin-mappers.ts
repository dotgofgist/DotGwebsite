import type { Database } from "@/lib/supabase/database.types";
import type { AdminProject, ProjectLink, ProjectMember } from "./types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectMemberRow = Database["public"]["Tables"]["project_members"]["Row"];
type ProjectLinkRow = Database["public"]["Tables"]["project_links"]["Row"];

export type AdminProjectRowWithRelations = ProjectRow & {
  project_members?: ProjectMemberRow[];
  project_links?: ProjectLinkRow[];
};

function mapMembers(rows: ProjectMemberRow[] | undefined): ProjectMember[] {
  return [...(rows ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      name: row.name,
      role: row.role,
    }));
}

function mapLinks(rows: ProjectLinkRow[] | undefined): ProjectLink[] {
  return [...(rows ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      type: row.link_type,
      label: row.label,
      href: row.url,
    }));
}

export function mapProjectRowToAdminProject(
  row: AdminProjectRowWithRelations,
): AdminProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    thumbnailUrl: undefined,
    thumbnailPath: row.thumbnail_path ?? undefined,
    status: row.status,
    publicationStatus: row.publication_status,
    publishedAt: row.published_at ?? undefined,
    sortOrder: row.sort_order,
    tags: row.tags,
    featured: row.featured,
    members: mapMembers(row.project_members),
    links: mapLinks(row.project_links),
    startedAt: row.started_at ?? undefined,
    releasedAt: row.released_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
