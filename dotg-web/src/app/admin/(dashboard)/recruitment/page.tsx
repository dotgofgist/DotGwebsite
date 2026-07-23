import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminPlaceholderNotice } from "@/components/shared/admin-placeholder-notice";
import { RecruitmentForm } from "@/features/recruitment/components/recruitment-form";
import { RecruitmentStatus } from "@/features/recruitment/components/recruitment-status";
import { getCurrentRecruitment } from "@/features/recruitment/queries";

export const metadata: Metadata = {
  title: "모집 관리",
};

export default function AdminRecruitmentPage() {
  const recruitment = getCurrentRecruitment();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="모집 관리"
        description="현재 모집 안내 데이터를 기준으로 편집 UI를 확인합니다."
        action={
          <Link className={buttonClasses({ variant: "secondary" })} href="/recruitment">
            공개 모집 페이지 보기
          </Link>
        }
      />
      <RecruitmentStatus status={recruitment.status} showDescription />
      <AdminPlaceholderNotice />
      <RecruitmentForm initialRecruitment={recruitment} />
    </div>
  );
}
