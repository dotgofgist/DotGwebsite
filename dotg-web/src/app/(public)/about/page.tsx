import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AboutPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="동아리 소개"
        description="DotG의 활동 방향, 운영 방식, 구성원을 소개하는 콘텐츠는 이후 단계에서 구현합니다."
      />
    </Container>
  );
}
