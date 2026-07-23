import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "../types";
import { ProjectStatusBadge } from "./project-status-badge";

type ProjectCardProps = {
  project: Project;
};

function ProjectThumbnail({ project }: ProjectCardProps) {
  if (project.thumbnailUrl) {
    return (
      <Image
        alt={`${project.title} 대표 이미지`}
        className="h-full w-full rounded-md object-cover"
        height={360}
        src={project.thumbnailUrl}
        width={640}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center rounded-md border border-border bg-surface"
    >
      <span className="text-4xl font-semibold text-primary">
        {project.title.charAt(0)}
      </span>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex h-full flex-col bg-background">
      <div className="m-4 mb-0 aspect-video overflow-hidden rounded-md">
        <ProjectThumbnail project={project} />
      </div>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <ProjectStatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          {project.summary}
        </p>
        {project.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="프로젝트 태그">
            {project.tags.map((tag) => (
              <li key={tag}>
                <Badge>{tag}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto">
          <Link
            className={buttonClasses({ variant: "secondary" })}
            href={`/projects/${project.slug}`}
          >
            {project.title} 상세 보기
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
