import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminPlaceholderNotice } from "@/components/shared/admin-placeholder-notice";
import { NoticeForm } from "@/features/notices/components/notice-form";

export const metadata: Metadata = {
  title: "새 공지사항",
};

export default function NewNoticePage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="새 공지사항"
        description="새 공지사항 작성 UI입니다. 입력 내용은 아직 저장되지 않습니다."
      />
      <AdminPlaceholderNotice />
      <NoticeForm />
    </div>
  );
}
