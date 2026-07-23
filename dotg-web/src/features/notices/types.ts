import type { Database } from "@/lib/supabase/database.types";

export type ContentStatus = Database["public"]["Enums"]["content_status"];

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

export type AdminNotice = Notice & {
  publicationStatus: ContentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export type NoticePreview = Pick<
  Notice,
  "id" | "slug" | "title" | "summary" | "pinned" | "publishedAt"
>;
