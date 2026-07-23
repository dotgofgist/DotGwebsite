import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ProjectNotFound() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="프로젝트를 찾을 수 없습니다"
        description="주소가 잘못되었거나 프로젝트가 삭제되었을 수 있습니다."
      />
      <div className="mt-8">
        <Link className={buttonClasses({ variant: "secondary" })} href="/projects">
          프로젝트 목록으로 돌아가기
        </Link>
      </div>
    </Container>
  );
}
