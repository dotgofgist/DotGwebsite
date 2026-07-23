import Link from "next/link";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import type { AdminProject, ContentStatus } from "../types";
import { ProjectDeleteForm } from "./project-delete-form";
import { ProjectStatusBadge } from "./project-status-badge";

type ProjectTableProps = {
  projects: AdminProject[];
};

const publicationLabels: Record<ContentStatus, string> = {
  draft: "초안",
  published: "공개",
  archived: "보관",
};

export function ProjectTable({ projects }: ProjectTableProps) {
  if (projects.length === 0) {
    return (
      <AdminEmptyState
        title="등록된 프로젝트가 없습니다"
        description="새 프로젝트를 생성하면 이 목록에서 관리할 수 있습니다."
      />
    );
  }

  return (
    <Card className="bg-surface">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">프로젝트</th>
              <th className="px-4 py-3 font-medium" scope="col">개발 상태</th>
              <th className="px-4 py-3 font-medium" scope="col">공개 상태</th>
              <th className="px-4 py-3 font-medium" scope="col">태그</th>
              <th className="px-4 py-3 font-medium" scope="col">수정일</th>
              <th className="px-4 py-3 font-medium" scope="col">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-4 align-top">
                  <p className="font-semibold">{project.title}</p>
                  <p className="mt-1 max-w-sm break-words text-xs text-neutral-400">
                    {project.slug}
                  </p>
                  {project.featured ? (
                    <p className="mt-2 text-xs font-medium text-primary">
                      대표 프로젝트
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4 align-top">
                  <ProjectStatusBadge status={project.status} />
                </td>
                <td className="px-4 py-4 align-top">
                  <Badge>{publicationLabels[project.publicationStatus]}</Badge>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  {formatDate(project.updatedAt) ?? "-"}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className={buttonClasses({ size: "sm", variant: "secondary" })}
                      href={`/admin/projects/${project.id}/edit`}
                    >
                      수정
                    </Link>
                    {project.publicationStatus === "published" ? (
                      <Link
                        className={buttonClasses({ size: "sm", variant: "ghost" })}
                        href={`/projects/${project.slug}`}
                      >
                        공개 보기
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-9 items-center rounded-md px-3 text-sm text-neutral-500">
                        공개 안 됨
                      </span>
                    )}
                    <ProjectDeleteForm
                      id={project.id}
                      slug={project.slug}
                      title={project.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
