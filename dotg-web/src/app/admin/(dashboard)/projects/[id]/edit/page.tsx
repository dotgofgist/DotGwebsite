import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;

  return (
    <Container className="py-16">
      <SectionHeading
        title="프로젝트 수정"
        description={`프로젝트 id "${id}"의 수정 화면은 이후 단계에서 구현합니다.`}
      />
    </Container>
  );
}
