import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminDashboardPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="관리자 대시보드"
        description="콘텐츠 현황과 빠른 관리 기능은 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
