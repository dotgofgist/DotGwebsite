import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NoticesLoading() {
  return (
    <Container className="space-y-10 py-16" aria-busy="true">
      <SectionHeading
        title="공지사항"
        description="공지사항을 불러오고 있습니다."
      />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            aria-hidden="true"
            className="h-28 rounded-lg border border-border bg-surface"
            key={index}
          />
        ))}
      </div>
    </Container>
  );
}
