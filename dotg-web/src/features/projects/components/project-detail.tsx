import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import type { Project } from "../types";
import { ProjectLinks } from "./project-links";
import { ProjectStatusBadge } from "./project-status-badge";

type ProjectDetailProps = {
  project: Project;
};

function formatDate(value: string): string | undefined {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function ProjectHeroImage({ project }: ProjectDetailProps) {
  if (project.thumbnailUrl) {
    return (
      <Image
        alt={`${project.title} 대표 이미지`}
        className="h-full w-full rounded-md object-cover"
        height={720}
        priority
        src={project.thumbnailUrl}
        width={1280}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-full min-h-72 items-center justify-center rounded-md border border-border bg-surface"
    >
      <span className="text-6xl font-semibold text-primary">
        {project.title.charAt(0)}
      </span>
    </div>
  );
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const startedAt = project.startedAt ? formatDate(project.startedAt) : undefined;
  const releasedAt = project.releasedAt
    ? formatDate(project.releasedAt)
    : undefined;

  return (
    <article>
      <section className="border-b border-border bg-background py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <ProjectStatusBadge status={project.status} />
              {project.featured ? <Badge tone="primary">대표 프로젝트</Badge> : null}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
                {project.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
                {project.summary}
              </p>
            </div>
            {project.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label="프로젝트 태그">
                {project.tags.map((tag) => (
                  <li key={tag}>
                    <Badge>{tag}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              className={buttonClasses({ variant: "secondary" })}
              href="/projects"
            >
              프로젝트 목록으로 돌아가기
            </Link>
          </div>
          <div className="aspect-video overflow-hidden rounded-lg">
            <ProjectHeroImage project={project} />
          </div>
        </Container>
      </section>

      <Container className="grid gap-8 py-14 lg:grid-cols-[1fr_0.45fr]">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-normal">
              프로젝트 소개
            </h2>
            <p className="whitespace-pre-line text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              {project.description}
            </p>
          </section>

          {project.members.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-normal">
                참여 구성원
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.members.map((member) => (
                  <li
                    className="rounded-lg border border-border bg-surface p-4"
                    key={`${member.name}-${member.role}`}
                  >
                    <p className="font-semibold">{member.name}</p>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                      {member.role}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-xl font-semibold tracking-normal">
                프로젝트 기간
              </h2>
              <dl className="space-y-3 text-sm">
                {startedAt ? (
                  <div>
                    <dt className="text-neutral-500">시작</dt>
                    <dd className="mt-1 font-medium">{startedAt}</dd>
                  </div>
                ) : null}
                {releasedAt ? (
                  <div>
                    <dt className="text-neutral-500">공개</dt>
                    <dd className="mt-1 font-medium">{releasedAt}</dd>
                  </div>
                ) : null}
                {!startedAt && !releasedAt ? (
                  <div>
                    <dt className="text-neutral-500">일정</dt>
                    <dd className="mt-1 font-medium">정리 중</dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-xl font-semibold tracking-normal">
                관련 링크
              </h2>
              <ProjectLinks links={project.links} />
            </CardContent>
          </Card>
        </aside>
      </Container>
    </article>
  );
}
