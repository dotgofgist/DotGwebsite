import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import type { Notice } from "../types";
import { NoticePinnedBadge } from "./notice-pinned-badge";

type NoticeItemProps = {
  notice: Notice;
};

export function NoticeItem({ notice }: NoticeItemProps) {
  const publishedAt = formatDate(notice.publishedAt);

  return (
    <Card className={notice.pinned ? "bg-background" : undefined}>
      <CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <NoticePinnedBadge pinned={notice.pinned} />
            {publishedAt ? (
              <time
                className="text-sm text-neutral-500"
                dateTime={notice.publishedAt}
              >
                {publishedAt}
              </time>
            ) : null}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-normal">
              {notice.title}
            </h2>
            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              {notice.summary}
            </p>
          </div>
        </div>
        <Link
          className={buttonClasses({ variant: "secondary" })}
          href={`/notices/${notice.slug}`}
        >
          {notice.title} 읽기
        </Link>
      </CardContent>
    </Card>
  );
}
