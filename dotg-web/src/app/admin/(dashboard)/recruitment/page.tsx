import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminRecruitmentPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="모집 관리"
        description="모집 상태, 지원 링크, 안내 문구 관리는 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
