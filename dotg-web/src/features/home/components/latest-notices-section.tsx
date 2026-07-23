import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getLatestNotices } from "@/features/notices/queries";
import { formatDate } from "@/lib/utils/date";

export async function LatestNoticesSection() {
  const latestNotices = await getLatestNotices(3);

  return (
    <section className="bg-surface py-16">
      <Container className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold text-primary">공지사항</p>
            <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              최신 안내 미리보기
            </h2>
            <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              공지사항 데이터에서 최근 안내를 가져와 표시합니다.
            </p>
          </div>
          <Link
            className={buttonClasses({ variant: "secondary" })}
            href="/notices"
          >
            전체 공지사항 보기
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {latestNotices.map((notice) => (
            <Card key={notice.title} className="bg-background">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  {notice.pinned ? <Badge tone="primary">고정</Badge> : null}
                  {formatDate(notice.publishedAt) ? (
                    <time
                      className="text-sm text-neutral-500"
                      dateTime={notice.publishedAt}
                    >
                      {formatDate(notice.publishedAt)}
                    </time>
                  ) : null}
                </div>
                <CardTitle className="text-lg">{notice.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {notice.summary}
                </p>
                <Link
                  className={buttonClasses({ variant: "secondary" })}
                  href={`/notices/${notice.slug}`}
                >
                  {notice.title} 읽기
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
