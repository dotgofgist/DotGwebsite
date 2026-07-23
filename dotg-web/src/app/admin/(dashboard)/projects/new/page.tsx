import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminPlaceholderNotice } from "@/components/shared/admin-placeholder-notice";
import { ProjectForm } from "@/features/projects/components/project-form";

export const metadata: Metadata = {
  title: "새 프로젝트",
};

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="새 프로젝트"
        description="새 프로젝트 등록 UI입니다. 입력 내용은 아직 저장되지 않습니다."
      />
      <AdminPlaceholderNotice />
      <ProjectForm />
    </div>
  );
}
