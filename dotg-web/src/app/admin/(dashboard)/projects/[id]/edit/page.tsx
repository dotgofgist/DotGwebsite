import type { Metadata } from "next";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminPlaceholderNotice } from "@/components/shared/admin-placeholder-notice";
import { ProjectForm } from "@/features/projects/components/project-form";
import { getAllProjects } from "@/features/projects/queries";

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "프로젝트 수정",
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  const project = getAllProjects().find((item) => item.id === id);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="프로젝트 수정"
        description={`프로젝트 id "${id}"의 수정 UI입니다.`}
      />
      {project ? (
        <>
          <AdminPlaceholderNotice />
          <ProjectForm initialProject={project} />
        </>
      ) : (
        <AdminEmptyState
          title="프로젝트를 찾을 수 없습니다"
          description="mock data에 해당 id의 프로젝트가 없습니다."
        />
      )}
    </div>
  );
}
