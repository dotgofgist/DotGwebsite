import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function HomePage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="DotG"
        description="게임창작부 웹사이트의 메인 페이지입니다. 이후 단계에서 동아리 소개, 프로젝트, 공지, 모집 정보를 한눈에 볼 수 있도록 구현합니다."
      />
    </Container>
  );
}
