import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { NoticeTable } from "@/features/notices/components/notice-table";
import { getAllNotices } from "@/features/notices/queries";

export const metadata: Metadata = {
  title: "공지사항 관리",
};

export default function AdminNoticesPage() {
  const notices = getAllNotices();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="공지사항 관리"
        description="mock data 기반 공지사항 목록입니다. 작성과 수정은 아직 저장되지 않습니다."
        action={
          <Link className={buttonClasses()} href="/admin/notices/new">
            새 공지사항
          </Link>
        }
      />
      <NoticeTable notices={notices} />
    </div>
  );
}
