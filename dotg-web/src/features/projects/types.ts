export type ProjectStatus = "planning" | "developing" | "released";

export type ProjectLinkType =
  | "github"
  | "website"
  | "download"
  | "youtube"
  | "steam"
  | "itchio";

export type ProjectLink = {
  type: ProjectLinkType;
  label: string;
  href: string;
};

export type ProjectMember = {
  name: string;
  role: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl?: string;
  status: ProjectStatus;
  tags: string[];
  featured: boolean;
  members: ProjectMember[];
  links: ProjectLink[];
  startedAt?: string;
  releasedAt?: string;
  createdAt: string;
};
