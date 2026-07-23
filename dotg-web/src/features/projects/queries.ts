import { projects } from "./mock-data";
import type { Project, ProjectStatus } from "./types";

const statusOrder: Record<ProjectStatus, number> = {
  developing: 1,
  planning: 2,
  released: 3,
};

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

export function getAllProjects(): Project[] {
  return sortProjects(projects);
}

export function getFeaturedProjects(limit?: number): Project[] {
  const featuredProjects = sortProjects(
    projects.filter((project) => project.featured),
  );

  if (typeof limit === "number") {
    return featuredProjects.slice(0, limit);
  }

  return featuredProjects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectsByStatus(status: ProjectStatus): Project[] {
  return sortProjects(projects.filter((project) => project.status === status));
}
