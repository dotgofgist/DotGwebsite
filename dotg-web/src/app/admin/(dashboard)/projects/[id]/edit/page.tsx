import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { getAdminProjectById } from "@/features/projects/admin-queries";
import { ProjectForm } from "@/features/projects/components/project-form";

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
  const project = await getAdminProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        description={`"${project.title}" 프로젝트를 수정합니다.`}
        title="프로젝트 수정"
      />
      <ProjectForm initialProject={project} mode="edit" />
    </div>
  );
}
