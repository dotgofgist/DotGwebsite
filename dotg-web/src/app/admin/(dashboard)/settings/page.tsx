import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminSettingsPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="사이트 설정"
        description="사이트 기본 정보와 외부 링크 설정 관리는 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
