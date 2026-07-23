import { Card, CardContent } from "@/components/ui/card";

export function ProjectEmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <h2 className="text-xl font-semibold tracking-normal">
          등록된 프로젝트가 없습니다.
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          새로운 프로젝트가 준비되면 이곳에 소개됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
