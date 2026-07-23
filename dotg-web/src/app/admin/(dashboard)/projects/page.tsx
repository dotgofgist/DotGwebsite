import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminProjectsPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="프로젝트 관리"
        description="프로젝트 목록 조회, 작성, 수정, 공개 상태 관리는 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
