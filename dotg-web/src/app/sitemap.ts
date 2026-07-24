import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/config/site-url";
import { getAllNotices } from "@/features/notices/queries";
import { getAllProjects } from "@/features/projects/queries";

const staticRoutes = [
  "/",
  "/about",
  "/projects",
  "/recruitment",
  "/notices",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, notices] = await Promise.all([getAllProjects(), getAllNotices()]);
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: getCanonicalUrl(route),
      lastModified: now,
    })),
    ...projects.map((project) => ({
      url: getCanonicalUrl(`/projects/${project.slug}`),
      lastModified: new Date(project.createdAt),
    })),
    ...notices.map((notice) => ({
      url: getCanonicalUrl(`/notices/${notice.slug}`),
      lastModified: new Date(notice.updatedAt ?? notice.publishedAt),
    })),
  ];
}
