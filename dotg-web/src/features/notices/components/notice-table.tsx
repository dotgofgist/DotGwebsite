import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils/date";
import type { Notice } from "../types";
import { NoticePinnedBadge } from "./notice-pinned-badge";

type NoticeTableProps = {
  notices: Notice[];
};

export function NoticeTable({ notices }: NoticeTableProps) {
  if (notices.length === 0) {
    return (
      <AdminEmptyState
        title="등록된 공지사항이 없습니다"
        description="공지사항이 준비되면 이곳에서 관리할 수 있습니다."
      />
    );
  }

  return (
    <Card className="bg-surface">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">공지</th>
              <th className="px-4 py-3 font-medium" scope="col">발행일</th>
              <th className="px-4 py-3 font-medium" scope="col">고정</th>
              <th className="px-4 py-3 font-medium" scope="col">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {notices.map((notice) => (
              <tr key={notice.id}>
                <td className="px-4 py-4 align-top">
                  <p className="font-semibold">{notice.title}</p>
                  <p className="mt-1 max-w-sm break-words text-xs text-neutral-400">
                    {notice.slug}
                  </p>
                </td>
                <td className="px-4 py-4 align-top">
                  {formatDate(notice.publishedAt) ?? "날짜 확인 필요"}
                </td>
                <td className="px-4 py-4 align-top">
                  <NoticePinnedBadge pinned={notice.pinned} />
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className={buttonClasses({ size: "sm", variant: "secondary" })}
                      href={`/admin/notices/${notice.id}/edit`}
                    >
                      {notice.title} 수정
                    </Link>
                    <Link
                      className={buttonClasses({ size: "sm", variant: "ghost" })}
                      href={`/notices/${notice.slug}`}
                    >
                      공개 보기
                    </Link>
                    <ConfirmDialog
                      description={`${notice.title} 삭제 기능은 아직 연결되지 않았습니다.`}
                      title={`${notice.title} 삭제 확인`}
                      triggerLabel="삭제"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
