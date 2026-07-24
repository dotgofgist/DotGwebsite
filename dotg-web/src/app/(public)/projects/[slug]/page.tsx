import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCanonicalUrl, getSiteMetadataBase } from "@/config/site-url";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { getProjectBySlug } from "@/features/projects/queries";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "프로젝트를 찾을 수 없습니다",
      description: "요청한 프로젝트가 존재하지 않습니다.",
    };
  }

  return {
    metadataBase: getSiteMetadataBase(),
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: getCanonicalUrl(`/projects/${project.slug}`),
    },
    openGraph: {
      title: project.title,
      description: project.summary,
      url: getCanonicalUrl(`/projects/${project.slug}`),
      type: "article",
      images: project.thumbnailUrl ? [project.thumbnailUrl] : ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: project.thumbnailUrl ? [project.thumbnailUrl] : ["/opengraph-image"],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
