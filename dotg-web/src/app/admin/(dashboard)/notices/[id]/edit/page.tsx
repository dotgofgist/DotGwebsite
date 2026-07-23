import type { Metadata } from "next";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminPlaceholderNotice } from "@/components/shared/admin-placeholder-notice";
import { NoticeForm } from "@/features/notices/components/notice-form";
import { getAllNotices } from "@/features/notices/queries";

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
  const notice = getAllNotices().find((item) => item.id === id);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="공지사항 수정"
        description={`공지사항 id "${id}"의 수정 UI입니다.`}
      />
      {notice ? (
        <>
          <AdminPlaceholderNotice />
          <NoticeForm initialNotice={notice} />
        </>
      ) : (
        <AdminEmptyState
          title="공지사항을 찾을 수 없습니다"
          description="mock data에 해당 id의 공지사항이 없습니다."
        />
      )}
    </div>
  );
}
