import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { ProjectForm } from "@/features/projects/components/project-form";

export const metadata: Metadata = {
  title: "새 프로젝트",
};

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        description="새 프로젝트는 기본적으로 초안 상태로 저장됩니다."
        title="새 프로젝트"
      />
      <ProjectForm mode="create" />
    </div>
  );
}
