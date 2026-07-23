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
  const slug = readString(formData, "slug").trim();
  const summary = readString(formData, "summary").trim();
  const content = readString(formData, "content").trim();
  const publicationStatus = readString(
    formData,
    "publicationStatus",
  ) as ContentStatus;
  const pinned = formData.get("pinned") === "on";
  const fieldErrors: NonNullable<NoticeActionState["fieldErrors"]> = {};

  if (id && !uuidPattern.test(id)) {
    fieldErrors.slug = "공지사항 id가 올바르지 않습니다.";
  }
  if (!title || title.length > 150) {
    fieldErrors.title = "제목은 1~150자로 입력해 주세요.";
  }
  if (!slugPattern.test(slug) || slug.length > 120) {
    fieldErrors.slug = "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.";
  }
  if (!summary || summary.length > 300) {
    fieldErrors.summary = "요약은 1~300자로 입력해 주세요.";
  }
  if (!content || content.length > 10000) {
    fieldErrors.content = "본문은 1~10000자로 입력해 주세요.";
  }
  if (!contentStatuses.has(publicationStatus)) {
    fieldErrors.publicationStatus = "공개 상태를 확인해 주세요.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "입력한 공지사항 정보를 확인해 주세요.",
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
    },
  };
}
