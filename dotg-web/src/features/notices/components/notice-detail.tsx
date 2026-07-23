import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { formatDate } from "@/lib/utils/date";
import type { Notice } from "../types";
import { NoticePinnedBadge } from "./notice-pinned-badge";

type NoticeDetailProps = {
  notice: Notice;
};

export function NoticeDetail({ notice }: NoticeDetailProps) {
  const publishedAt = formatDate(notice.publishedAt);
  const updatedAt = notice.updatedAt ? formatDate(notice.updatedAt) : null;
  const paragraphs = notice.content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article>
      <section className="border-b border-border bg-background py-16">
        <Container className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <NoticePinnedBadge pinned={notice.pinned} />
            {publishedAt ? (
              <time className="text-sm text-neutral-500" dateTime={notice.publishedAt}>
                발행 {publishedAt}
              </time>
            ) : null}
            {notice.updatedAt && updatedAt ? (
              <time className="text-sm text-neutral-500" dateTime={notice.updatedAt}>
                수정 {updatedAt}
              </time>
            ) : null}
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
            {notice.title}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
            {notice.summary}
          </p>
        </Container>
      </section>

      <Container className="py-14">
        <div className="max-w-3xl space-y-6">
          {paragraphs.map((paragraph) => (
            <p
              className="text-base leading-8 text-neutral-700 break-words dark:text-neutral-200"
              key={paragraph}
            >
              {paragraph}
            </p>
          ))}
          <div className="pt-4">
            <Link
              className={buttonClasses({ variant: "secondary" })}
              href="/notices"
            >
              공지사항 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </Container>
    </article>
  );
}
