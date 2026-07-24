import type { ContentStatus } from "./types";

export type NoticeActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    publicationStatus?: string;
    updatedAt?: string;
  };
};

export type NoticeFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  pinned: boolean;
  publicationStatus: ContentStatus;
  updatedAt?: string;
};

const contentStatuses = new Set<ContentStatus>([
  "draft",
  "published",
  "archived",
]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function validateNoticeFormData(formData: FormData):
  | { ok: true; values: NoticeFormValues }
  | { ok: false; state: NoticeActionState } {
  const id = readString(formData, "id").trim();
  const title = readString(formData, "title").trim();
  const slug = readString(formData, "slug").trim().toLowerCase();
  const summary = readString(formData, "summary").trim();
  const content = readString(formData, "content").trim();
  const publicationStatus = readString(formData, "publicationStatus") as ContentStatus;
  const pinned = formData.get("pinned") === "on";
  const updatedAt = readString(formData, "updatedAt").trim();
  const fieldErrors: NonNullable<NoticeActionState["fieldErrors"]> = {};

  if (id && !uuidPattern.test(id)) fieldErrors.slug = "Invalid notice id.";
  if (id && !updatedAt) fieldErrors.updatedAt = "Refresh this notice before saving again.";
  if (!title || title.length > 150) fieldErrors.title = "Title must be 1-150 characters.";
  if (!slugPattern.test(slug) || slug.length > 120) {
    fieldErrors.slug = "Slug must use lowercase letters, numbers, and single hyphens.";
  }
  if (!summary || summary.length > 300) fieldErrors.summary = "Summary must be 1-300 characters.";
  if (!content || content.length > 10000) fieldErrors.content = "Content must be 1-10000 characters.";
  if (!contentStatuses.has(publicationStatus)) {
    fieldErrors.publicationStatus = "Choose a valid publication status.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Check the notice form fields.",
        fieldErrors,
      },
    };
  }

  return {
    ok: true,
    values: {
      id: id || undefined,
      title,
      slug,
      summary,
      content,
      pinned,
      publicationStatus,
      updatedAt: updatedAt || undefined,
    },
  };
}
