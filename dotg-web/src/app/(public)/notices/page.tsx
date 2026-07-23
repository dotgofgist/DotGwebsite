import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NoticesPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="공지사항"
        description="공지사항 목록, 고정 공지, 검색과 페이지네이션은 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
