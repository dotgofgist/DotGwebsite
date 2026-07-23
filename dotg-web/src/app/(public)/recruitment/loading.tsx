import { Container } from "@/components/ui/container";

export default function RecruitmentLoading() {
  return (
    <Container className="space-y-6 py-16" aria-busy="true">
      <div className="h-8 w-32 rounded-md bg-surface" aria-hidden="true" />
      <div className="h-12 max-w-xl rounded-md bg-surface" aria-hidden="true" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            aria-hidden="true"
            className="h-32 rounded-lg border border-border bg-surface"
            key={index}
          />
        ))}
      </div>
    </Container>
  );
}
