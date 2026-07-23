import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function RecruitmentPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="모집 안내"
        description="신입 부원 모집 일정, 지원 링크, 자주 묻는 질문은 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
