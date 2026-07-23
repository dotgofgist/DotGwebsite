import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateRange } from "@/lib/utils/date";
import { getAllAdminRecruitments } from "@/features/recruitment/admin-queries";
import { RecruitmentAdminList } from "@/features/recruitment/components/recruitment-admin-list";
import { PublicationStatusBadge } from "@/features/recruitment/components/recruitment-status-badge";
import { getRecruitmentStatusLabel } from "@/features/recruitment/components/recruitment-status";

type AdminRecruitmentPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "모집 관리",
};

function statusMessage(params: Record<string, string | string[] | undefined>) {
  if (params.created) return "모집 정보를 생성했습니다.";
  if (params.saved) return "모집 정보를 저장했습니다.";
  if (params.current) return "현재 모집을 지정했습니다.";
  if (params.unset) return "현재 모집 지정을 해제했습니다.";
  if (params.archived) return "모집 정보를 보관했습니다.";
  if (params.error === "archived-current") {
    return "보관 상태의 모집은 현재 모집으로 지정할 수 없습니다.";
  }
  if (params.error) return "요청을 처리하지 못했습니다. 다시 시도해 주세요.";

  return null;
}

export default async function AdminRecruitmentPage({
  searchParams,
}: AdminRecruitmentPageProps) {
  const params = (await searchParams) ?? {};
  const recruitments = await getAllAdminRecruitments();
  const current = recruitments.find((recruitment) => recruitment.isCurrent);
  const message = statusMessage(params);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="모집 관리"
        description="모집 이력을 만들고 현재 공개할 모집 정보를 지정합니다."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link className={buttonClasses({ variant: "secondary" })} href="/recruitment">
              공개 모집 보기
            </Link>
            <Link className={buttonClasses()} href="/admin/recruitment/new">
              새 모집 정보
            </Link>
          </div>
        }
      />

      {message ? (
        <p className="rounded-md border border-border bg-surface p-3 text-sm leading-6">
          {message}
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="text-xl font-semibold tracking-normal">현재 모집</h2>
          {current ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <PublicationStatusBadge status={current.publicationStatus} />
                <span className="text-sm text-neutral-500">
                  {getRecruitmentStatusLabel(current.status)}
                </span>
              </div>
              <p className="font-semibold">{current.title}</p>
              <p className="text-sm text-neutral-500">
                {formatDateRange(current.schedule.startsAt, current.schedule.endsAt) || "일정 미정"}
              </p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-neutral-500">
              현재 지정된 모집 정보가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-normal">모집 정보 목록</h2>
        <RecruitmentAdminList recruitments={recruitments} />
      </section>
    </div>
  );
}
