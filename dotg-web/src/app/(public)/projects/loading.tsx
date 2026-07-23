import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ProjectsLoading() {
  return (
    <Container className="space-y-10 py-16" aria-busy="true">
      <SectionHeading
        title="프로젝트"
        description="프로젝트 정보를 불러오고 있습니다."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            aria-hidden="true"
            className="h-64 rounded-lg border border-border bg-surface"
            key={index}
          />
        ))}
      </div>
    </Container>
  );
}
