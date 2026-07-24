import type { Metadata } from "next";
import { getCanonicalUrl } from "@/config/site-url";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectGrid } from "@/features/projects/components/project-grid";
import { getAllProjects } from "@/features/projects/queries";

export const metadata: Metadata = {
  alternates: {
    canonical: getCanonicalUrl("/projects"),
  },
  title: "프로젝트",
  description: "DotG 게임창작부에서 진행하는 프로젝트를 소개합니다.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <Container className="space-y-10 py-16">
      <SectionHeading
        title="프로젝트"
        description="아이디어를 실제 게임으로 발전시키는 과정을 소개합니다."
      />
      <ProjectGrid projects={projects} />
    </Container>
  );
}
