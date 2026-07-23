import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

type NoticeDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  const { slug } = await params;

  return (
    <Container className="py-16">
      <SectionHeading
        title="공지사항 상세"
        description={`공지사항 slug "${slug}"에 해당하는 상세 콘텐츠는 이후 단계에서 구현합니다.`}
      />
    </Container>
  );
}
