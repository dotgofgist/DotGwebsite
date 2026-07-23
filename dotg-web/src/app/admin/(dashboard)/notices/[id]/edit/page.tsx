import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { getAdminNoticeById } from "@/features/notices/admin-queries";
import { NoticeForm } from "@/features/notices/components/notice-form";

type EditNoticePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "공지사항 수정",
};

export default async function EditNoticePage({
  params,
}: EditNoticePageProps) {
  const { id } = await params;
  const notice = await getAdminNoticeById(id);

  if (!notice) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        description={`"${notice.title}" 공지사항을 수정합니다.`}
        title="공지사항 수정"
      />
      <NoticeForm initialNotice={notice} mode="edit" />
    </div>
  );
}
