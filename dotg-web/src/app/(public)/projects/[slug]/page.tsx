import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;

  return (
    <Container className="py-16">
      <SectionHeading
        title="프로젝트 상세"
        description={`프로젝트 slug "${slug}"에 해당하는 상세 콘텐츠는 이후 단계에서 구현합니다.`}
      />
    </Container>
  );
}
