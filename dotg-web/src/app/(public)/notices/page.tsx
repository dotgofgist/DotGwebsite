import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { NoticeList } from "@/features/notices/components/notice-list";
import { getAllNotices } from "@/features/notices/queries";

export const metadata: Metadata = {
  title: "공지사항",
  description: "DotG 게임창작부의 주요 소식과 안내를 확인합니다.",
};

export default function NoticesPage() {
  const notices = getAllNotices();

  return (
    <Container className="space-y-10 py-16">
      <SectionHeading
        title="공지사항"
        description="동아리 운영, 프로젝트, 모집과 관련된 주요 안내를 확인할 수 있습니다."
      />
      <NoticeList notices={notices} />
    </Container>
  );
}
