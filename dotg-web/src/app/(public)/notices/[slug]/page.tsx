import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoticeDetail } from "@/features/notices/components/notice-detail";
import { getAllNotices, getNoticeBySlug } from "@/features/notices/queries";

type NoticeDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllNotices().map((notice) => ({
    slug: notice.slug,
  }));
}

export async function generateMetadata({
  params,
}: NoticeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const notice = getNoticeBySlug(slug);

  if (!notice) {
    return {
      title: "공지사항을 찾을 수 없습니다",
      description: "요청한 공지사항이 존재하지 않습니다.",
    };
  }

  return {
    title: notice.title,
    description: notice.summary,
  };
}

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  const { slug } = await params;
  const notice = getNoticeBySlug(slug);

  if (!notice) {
    notFound();
  }

  return <NoticeDetail notice={notice} />;
}
