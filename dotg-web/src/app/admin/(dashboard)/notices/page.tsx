import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminNoticesPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="공지사항 관리"
        description="공지사항 목록 조회, 작성, 수정, 고정 여부 관리는 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
