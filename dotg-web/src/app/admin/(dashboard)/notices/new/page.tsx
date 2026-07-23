import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { NoticeForm } from "@/features/notices/components/notice-form";

export const metadata: Metadata = {
  title: "새 공지사항",
};

export default function NewNoticePage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        description="새 공지사항은 기본적으로 초안 상태로 저장됩니다."
        title="새 공지사항"
      />
      <NoticeForm mode="create" />
    </div>
  );
}
