import { Card, CardContent } from "@/components/ui/card";

export function NoticeEmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <h2 className="text-xl font-semibold tracking-normal">
          등록된 공지사항이 없습니다.
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          새로운 안내가 등록되면 이곳에 표시됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
