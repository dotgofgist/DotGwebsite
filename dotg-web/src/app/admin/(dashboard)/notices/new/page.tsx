import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NewNoticePage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="공지사항 작성"
        description="새 공지사항 입력 폼과 저장 액션은 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
