import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { getAllAdminProjects } from "@/features/projects/admin-queries";
import { ProjectTable } from "@/features/projects/components/project-table";

export const metadata: Metadata = {
  title: "프로젝트 관리",
};

export default async function AdminProjectsPage() {
  const projects = await getAllAdminProjects();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        action={
          <Link className={buttonClasses()} href="/admin/projects/new">
            새 프로젝트
          </Link>
        }
        description="프로젝트 목록과 저장 기능은 Supabase 데이터와 연결됩니다."
        title="프로젝트 관리"
      />
      <ProjectTable projects={projects} />
    </div>
  );
}
