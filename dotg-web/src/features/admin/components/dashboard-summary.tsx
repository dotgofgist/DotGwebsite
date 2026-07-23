import { getPublicationStatusLabel } from "@/features/recruitment/components/recruitment-status-badge";
import { getRecruitmentStatusLabel } from "@/features/recruitment/components/recruitment-status";
import type { AdminRecruitment } from "@/features/recruitment/types";
import type { Notice } from "@/features/notices/types";
import type { Project } from "@/features/projects/types";
import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardSummaryProps = {
  projects: Project[];
  notices: Notice[];
  recruitment?: AdminRecruitment;
};

export function DashboardSummary({
  projects,
  notices,
  recruitment,
}: DashboardSummaryProps) {
  const pinnedNoticeCount = notices.filter((notice) => notice.pinned).length;
  const recruitmentDescription = recruitment
    ? `${getPublicationStatusLabel(recruitment.publicationStatus)} · ${
        recruitment.schedule.startsAt?.slice(0, 10) ?? "일정 미정"
      }`
    : "현재 지정된 모집 정보가 없습니다.";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        description="등록된 프로젝트"
        href="/admin/projects"
        label="프로젝트"
        value={projects.length}
      />
      <DashboardStatCard
        description="등록된 공지사항"
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
        description={recruitmentDescription}
        href="/admin/recruitment"
        label="모집 상태"
        value={recruitment ? getRecruitmentStatusLabel(recruitment.status) : "미지정"}
      />
    </div>
  );
}
