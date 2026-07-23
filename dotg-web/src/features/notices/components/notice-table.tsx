import Link from "next/link";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import type { AdminNotice, ContentStatus } from "../types";
import { NoticeDeleteForm } from "./notice-delete-form";
import { NoticePinnedBadge } from "./notice-pinned-badge";

type NoticeTableProps = {
  notices: AdminNotice[];
};

const publicationLabels: Record<ContentStatus, string> = {
  draft: "초안",
  published: "공개",
  archived: "보관",
};

export function NoticeTable({ notices }: NoticeTableProps) {
  if (notices.length === 0) {
    return (
      <AdminEmptyState
        title="등록된 공지사항이 없습니다"
        description="새 공지사항을 생성하면 이 목록에서 관리할 수 있습니다."
      />
    );
  }

  return (
    <Card className="bg-surface">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-border text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">공지</th>
              <th className="px-4 py-3 font-medium" scope="col">공개 상태</th>
              <th className="px-4 py-3 font-medium" scope="col">발행일</th>
              <th className="px-4 py-3 font-medium" scope="col">수정일</th>
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
                  <Badge>{publicationLabels[notice.publicationStatus]}</Badge>
                </td>
                <td className="px-4 py-4 align-top">
                  {notice.publishedAt ? formatDate(notice.publishedAt) : "-"}
                </td>
                <td className="px-4 py-4 align-top">
                  {formatDate(notice.updatedAt) ?? "-"}
                </td>
                <td className="px-4 py-4 align-top">
                  {notice.pinned ? <NoticePinnedBadge pinned /> : "일반"}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className={buttonClasses({ size: "sm", variant: "secondary" })}
                      href={`/admin/notices/${notice.id}/edit`}
                    >
                      수정
                    </Link>
                    {notice.publicationStatus === "published" ? (
                      <Link
                        className={buttonClasses({ size: "sm", variant: "ghost" })}
                        href={`/notices/${notice.slug}`}
                      >
                        공개 보기
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-9 items-center rounded-md px-3 text-sm text-neutral-500">
                        공개 안 됨
                      </span>
                    )}
                    <NoticeDeleteForm
                      id={notice.id}
                      slug={notice.slug}
                      title={notice.title}
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
