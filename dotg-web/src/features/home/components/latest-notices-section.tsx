import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const latestNotices = [
  {
    title: "웹사이트 준비 안내",
    description: "프로젝트와 모집 정보를 순차적으로 업데이트할 예정입니다.",
    status: "준비 중",
  },
  {
    title: "공지사항 영역 준비",
    description: "동아리 소식과 안내는 공지사항 페이지에서 확인할 수 있습니다.",
    status: "예정",
  },
];

export function LatestNoticesSection() {
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
              일정이 확정되지 않은 내용은 임의 날짜 없이 상태만 표시합니다.
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
                <p className="text-sm font-semibold text-primary">
                  {notice.status}
                </p>
                <CardTitle className="text-lg">{notice.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {notice.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
