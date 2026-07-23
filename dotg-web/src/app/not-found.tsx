import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NotFound() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="페이지를 찾을 수 없습니다"
        description="요청한 경로에 해당하는 페이지가 없습니다. 이후 단계에서 사용자 안내와 이동 경로를 보강합니다."
      />
    </Container>
  );
}
