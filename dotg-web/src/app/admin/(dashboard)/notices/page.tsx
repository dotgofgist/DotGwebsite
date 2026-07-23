import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { getAllAdminNotices } from "@/features/notices/admin-queries";
import { NoticeTable } from "@/features/notices/components/notice-table";

export const metadata: Metadata = {
  title: "공지사항 관리",
};

export default async function AdminNoticesPage() {
  const notices = await getAllAdminNotices();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        action={
          <Link className={buttonClasses()} href="/admin/notices/new">
            새 공지사항
          </Link>
        }
        description="공지사항 목록과 저장 기능은 Supabase 데이터와 연결됩니다."
        title="공지사항 관리"
      />
      <NoticeTable notices={notices} />
    </div>
  );
}
