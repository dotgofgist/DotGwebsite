import { getRecruitmentStatusLabel } from "@/features/recruitment/components/recruitment-status";
import type { Recruitment } from "@/features/recruitment/types";
import type { Notice } from "@/features/notices/types";
import type { Project } from "@/features/projects/types";
import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardSummaryProps = {
  projects: Project[];
  notices: Notice[];
  recruitment: Recruitment;
};

export function DashboardSummary({
  projects,
  notices,
  recruitment,
}: DashboardSummaryProps) {
  const pinnedNoticeCount = notices.filter((notice) => notice.pinned).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        description="등록된 프로젝트 mock data"
        href="/admin/projects"
        label="프로젝트"
        value={projects.length}
      />
      <DashboardStatCard
        description="등록된 공지사항 mock data"
        href="/admin/notices"
        label="공지사항"
        value={notices.length}
      />
      <DashboardStatCard
        description="고정으로 표시되는 공지"
        href="/admin/notices"
        label="고정 공지"
        value={pinnedNoticeCount}
      />
      <DashboardStatCard
        description="현재 모집 mock data 상태"
        href="/admin/recruitment"
        label="모집 상태"
        value={getRecruitmentStatusLabel(recruitment.status)}
      />
    </div>
  );
}
