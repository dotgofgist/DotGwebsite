import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Project } from "../types";
import { ProjectStatusBadge } from "./project-status-badge";

type ProjectTableProps = {
  projects: Project[];
};

export function ProjectTable({ projects }: ProjectTableProps) {
  if (projects.length === 0) {
    return (
      <AdminEmptyState
        title="등록된 프로젝트가 없습니다"
        description="프로젝트가 준비되면 이곳에서 관리할 수 있습니다."
      />
    );
  }

  return (
    <Card className="bg-surface">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">프로젝트</th>
              <th className="px-4 py-3 font-medium" scope="col">상태</th>
              <th className="px-4 py-3 font-medium" scope="col">태그</th>
              <th className="px-4 py-3 font-medium" scope="col">대표</th>
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
                </td>
                <td className="px-4 py-4 align-top">
                  <ProjectStatusBadge status={project.status} />
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  {project.featured ? "대표" : "일반"}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className={buttonClasses({ size: "sm", variant: "secondary" })}
                      href={`/admin/projects/${project.id}/edit`}
                    >
                      {project.title} 수정
                    </Link>
                    <Link
                      className={buttonClasses({ size: "sm", variant: "ghost" })}
                      href={`/projects/${project.slug}`}
                    >
                      공개 보기
                    </Link>
                    <ConfirmDialog
                      description={`${project.title} 삭제 기능은 아직 연결되지 않았습니다.`}
                      title={`${project.title} 삭제 확인`}
                      triggerLabel="삭제"
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
