import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

type EditNoticePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditNoticePage({
  params,
}: EditNoticePageProps) {
  const { id } = await params;

  return (
    <Container className="py-16">
      <SectionHeading
        title="공지사항 수정"
        description={`공지사항 id "${id}"의 수정 화면은 이후 단계에서 구현합니다.`}
      />
    </Container>
  );
}
