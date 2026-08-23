export type MemberProfile = {
  id: string;
  slug: string;
  name: string;
  position: string;
  summary: string;
  details: string;
  skills: string[];
  imageUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  updatedAt: string;
};
