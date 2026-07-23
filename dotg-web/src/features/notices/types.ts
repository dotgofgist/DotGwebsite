export type Notice = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  pinned: boolean;
  publishedAt: string;
  updatedAt?: string;
};

export type NoticePreview = Pick<
  Notice,
  "id" | "slug" | "title" | "summary" | "pinned" | "publishedAt"
>;
