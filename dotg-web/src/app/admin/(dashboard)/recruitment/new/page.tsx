import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { RecruitmentForm } from "@/features/recruitment/components/recruitment-form";

export const metadata: Metadata = {
  title: "새 모집 정보",
};

export default function NewRecruitmentPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="새 모집 정보"
        description="새 모집은 기본적으로 초안이며 현재 모집으로 자동 지정되지 않습니다."
        action={
          <Link className={buttonClasses({ variant: "secondary" })} href="/admin/recruitment">
            목록으로
          </Link>
        }
      />
      <RecruitmentForm mode="create" />
    </div>
  );
}
