import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminLoginPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="관리자 로그인"
        description="관리자 인증 화면은 이후 단계에서 Supabase 인증 정책에 맞춰 구현합니다."
      />
    </Container>
  );
}
