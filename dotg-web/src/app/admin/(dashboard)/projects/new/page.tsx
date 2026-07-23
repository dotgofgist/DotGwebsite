import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NewProjectPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="프로젝트 작성"
        description="새 프로젝트 입력 폼과 저장 액션은 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
