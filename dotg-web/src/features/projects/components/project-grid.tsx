import type { Project } from "../types";
import { ProjectCard } from "./project-card";
import { ProjectEmptyState } from "./project-empty-state";

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return <ProjectEmptyState />;
  }

  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
