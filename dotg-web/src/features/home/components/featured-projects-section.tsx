import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProjectEmptyState } from "@/features/projects/components/project-empty-state";
import { ProjectGrid } from "@/features/projects/components/project-grid";
import { getAllProjects, getFeaturedProjects } from "@/features/projects/queries";

export async function FeaturedProjectsSection() {
  const featuredProjects = await getFeaturedProjects(3);
  const projects =
    featuredProjects.length > 0
      ? featuredProjects
      : (await getAllProjects()).slice(0, 3);

  return (
    <section className="py-16">
      <Container className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold text-primary">
              대표 프로젝트
            </p>
            <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              프로젝트 미리보기
            </h2>
            <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              실제 프로젝트 데이터가 준비되면 대표작과 제작 기록을 이 영역에
              표시합니다.
            </p>
          </div>
          <Link
            className={buttonClasses({ variant: "secondary" })}
            href="/projects"
          >
            전체 프로젝트 보기
          </Link>
        </div>

        {projects.length > 0 ? (
          <ProjectGrid projects={projects} />
        ) : (
          <ProjectEmptyState />
        )}
      </Container>
    </section>
  );
}
