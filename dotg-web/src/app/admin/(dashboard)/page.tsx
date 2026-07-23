import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminPlaceholderNotice } from "@/components/shared/admin-placeholder-notice";
import { DashboardSummary } from "@/features/admin/components/dashboard-summary";
import { RecentContentList } from "@/features/admin/components/recent-content-list";
import { getAllNotices } from "@/features/notices/queries";
import { getAllProjects } from "@/features/projects/queries";
import { getCurrentRecruitment } from "@/features/recruitment/queries";

export const metadata: Metadata = {
  title: "관리자 대시보드",
};

export default function AdminDashboardPage() {
  const projects = getAllProjects();
  const notices = getAllNotices();
  const recruitment = getCurrentRecruitment();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="관리자 대시보드"
        description="공개 사이트 콘텐츠 현황과 주요 관리 페이지를 확인합니다."
      />
      <AdminPlaceholderNotice />
      <DashboardSummary projects={projects} notices={notices} recruitment={recruitment} />
      <div className="grid gap-5 lg:grid-cols-2">
        <RecentContentList
          title="최근 프로젝트"
          items={projects.slice(0, 3).map((project) => ({
            title: project.title,
            description: project.summary,
            href: `/admin/projects/${project.id}/edit`,
          }))}
        />
        <RecentContentList
          title="최근 공지사항"
          items={notices.slice(0, 3).map((notice) => ({
            title: notice.title,
            description: notice.summary,
            href: `/admin/notices/${notice.id}/edit`,
          }))}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link className={buttonClasses({ variant: "secondary" })} href="/admin/projects/new">
          새 프로젝트
        </Link>
        <Link className={buttonClasses({ variant: "secondary" })} href="/admin/notices/new">
          새 공지사항
        </Link>
        <Link className={buttonClasses({ variant: "secondary" })} href="/admin/settings">
          사이트 설정
        </Link>
      </div>
    </div>
  );
}
