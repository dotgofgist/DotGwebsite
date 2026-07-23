import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ProjectsPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="프로젝트"
        description="동아리에서 제작한 게임 프로젝트 목록과 필터 기능은 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
