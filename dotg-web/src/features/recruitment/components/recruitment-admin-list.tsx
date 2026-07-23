import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateRange } from "@/lib/utils/date";
import { getRecruitmentStatusLabel } from "./recruitment-status";
import { CurrentRecruitmentForm } from "./current-recruitment-form";
import { PublicationStatusBadge } from "./recruitment-status-badge";
import type { AdminRecruitment } from "../types";

type RecruitmentAdminListProps = {
  recruitments: AdminRecruitment[];
};

export function RecruitmentAdminList({
  recruitments,
}: RecruitmentAdminListProps) {
  if (recruitments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold tracking-normal">모집 정보가 없습니다</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            새 모집 정보를 만들어 공개 준비를 시작할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {recruitments.map((recruitment) => {
        const schedule = formatDateRange(
          recruitment.schedule.startsAt,
          recruitment.schedule.endsAt,
        );

        return (
          <Card key={recruitment.id}>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {recruitment.isCurrent ? <Badge tone="primary">현재 모집</Badge> : null}
                  <Badge>{getRecruitmentStatusLabel(recruitment.status)}</Badge>
                  <PublicationStatusBadge status={recruitment.publicationStatus} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-normal break-words">
                    {recruitment.title}
                  </h2>
                  <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    {recruitment.summary}
                  </p>
                </div>
                <dl className="grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="font-medium text-foreground">기간</dt>
                    <dd>{schedule || "일정 미정"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">지원 링크</dt>
                    <dd>{recruitment.applicationUrl ? "있음" : "없음"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">절차</dt>
                    <dd>{recruitment.stepCount ?? recruitment.process.length}개</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">수정일</dt>
                    <dd>{recruitment.updatedAt.slice(0, 10)}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Link
                  className={buttonClasses({ variant: "secondary" })}
                  href={`/admin/recruitment/${recruitment.id}/edit`}
                >
                  수정
                </Link>
                <CurrentRecruitmentForm recruitment={recruitment} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
