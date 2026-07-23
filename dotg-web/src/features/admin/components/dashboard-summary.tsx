import { getPublicationStatusLabel } from "@/features/recruitment/components/recruitment-status-badge";
import { getRecruitmentStatusLabel } from "@/features/recruitment/components/recruitment-status";
import type { AdminRecruitment } from "@/features/recruitment/types";
import type {
  AdminContactItem,
  AdminSiteSettings,
  AdminSocialLink,
} from "@/features/settings/types";
import type { Notice } from "@/features/notices/types";
import type { Project } from "@/features/projects/types";
import { DashboardStatCard } from "./dashboard-stat-card";

type DashboardSummaryProps = {
  projects: Project[];
  notices: Notice[];
  recruitment?: AdminRecruitment;
  siteSettings?: AdminSiteSettings;
  contactItems: AdminContactItem[];
  socialLinks: AdminSocialLink[];
};

export function DashboardSummary({
  projects,
  notices,
  recruitment,
  siteSettings,
  contactItems,
  socialLinks,
}: DashboardSummaryProps) {
  const pinnedNoticeCount = notices.filter((notice) => notice.pinned).length;
  const activeContactCount = contactItems.filter((item) => item.isActive).length;
  const activeSocialCount = socialLinks.filter(
    (link) => link.isActive && link.url,
  ).length;
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
        description={`고정 공지 ${pinnedNoticeCount}개`}
        href="/admin/notices"
        label="공지사항"
        value={notices.length}
      />
      <DashboardStatCard
        description={recruitmentDescription}
        href="/admin/recruitment"
        label="모집 상태"
        value={recruitment ? getRecruitmentStatusLabel(recruitment.status) : "미지정"}
      />
      <DashboardStatCard
        description={`연락처 ${activeContactCount}/${contactItems.length} · SNS ${activeSocialCount}/${socialLinks.length}`}
        href="/admin/settings"
        label="사이트 설정"
        value={siteSettings ? "등록됨" : "미등록"}
      />
    </div>
  );
}
