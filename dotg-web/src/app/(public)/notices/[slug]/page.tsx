import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCanonicalUrl, getSiteMetadataBase } from "@/config/site-url";
import { NoticeDetail } from "@/features/notices/components/notice-detail";
import { getNoticeBySlug } from "@/features/notices/queries";

type NoticeDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: NoticeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const notice = await getNoticeBySlug(slug);

  if (!notice) {
    return {
      title: "공지사항을 찾을 수 없습니다",
      description: "요청한 공지사항이 존재하지 않습니다.",
    };
  }

  return {
    metadataBase: getSiteMetadataBase(),
    title: notice.title,
    description: notice.summary,
    alternates: {
      canonical: getCanonicalUrl(`/notices/${notice.slug}`),
    },
    openGraph: {
      title: notice.title,
      description: notice.summary,
      url: getCanonicalUrl(`/notices/${notice.slug}`),
      type: "article",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: notice.title,
      description: notice.summary,
      images: ["/opengraph-image"],
    },
  };
}

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  const { slug } = await params;
  const notice = await getNoticeBySlug(slug);

  if (!notice) {
    notFound();
  }

  return <NoticeDetail notice={notice} />;
}
