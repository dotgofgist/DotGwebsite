import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { ProjectTable } from "@/features/projects/components/project-table";
import { getAllProjects } from "@/features/projects/queries";

export const metadata: Metadata = {
  title: "프로젝트 관리",
};

export default function AdminProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="프로젝트 관리"
        description="mock data 기반 프로젝트 목록입니다. 수정과 삭제는 아직 저장되지 않습니다."
        action={
          <Link className={buttonClasses()} href="/admin/projects/new">
            새 프로젝트
          </Link>
        }
      />
      <ProjectTable projects={projects} />
    </div>
  );
}
