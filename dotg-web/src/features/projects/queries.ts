import { isSupabaseConfigured } from "@/lib/supabase/env";
import { projects } from "./mock-data";
import type { Project, ProjectStatus } from "./types";

const statusOrder: Record<ProjectStatus, number> = {
  developing: 1,
  planning: 2,
  released: 3,
  archived: 4,
};

function ensureGeneratedDatabaseTypes(scope: string): void {
  if (isSupabaseConfigured()) {
    throw new Error(
      `${scope} Supabase 조회를 위해 src/lib/supabase/database.types.ts 생성이 필요합니다.`,
    );
  }
}

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

export async function getAllProjects(): Promise<Project[]> {
  ensureGeneratedDatabaseTypes("공개 프로젝트 목록");

  return sortProjects(projects);
}

export async function getFeaturedProjects(limit?: number): Promise<Project[]> {
  ensureGeneratedDatabaseTypes("대표 프로젝트");

  const featuredProjects = sortProjects(
    projects.filter((project) => project.featured),
  );

  if (typeof limit === "number") {
    return featuredProjects.slice(0, limit);
  }

  return featuredProjects;
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  ensureGeneratedDatabaseTypes("공개 프로젝트 상세");

  return projects.find((project) => project.slug === slug);
}

export async function getProjectsByStatus(
  status: ProjectStatus,
): Promise<Project[]> {
  ensureGeneratedDatabaseTypes("공개 프로젝트 상태별 목록");

  return sortProjects(projects.filter((project) => project.status === status));
}
