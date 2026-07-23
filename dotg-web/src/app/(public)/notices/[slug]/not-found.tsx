import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NoticeNotFound() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="공지사항을 찾을 수 없습니다"
        description="주소가 잘못되었거나 공지가 삭제되었을 수 있습니다."
      />
      <div className="mt-8">
        <Link className={buttonClasses({ variant: "secondary" })} href="/notices">
          공지사항 목록으로 돌아가기
        </Link>
      </div>
    </Container>
  );
}
