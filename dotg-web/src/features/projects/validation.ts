import type {
  ContentStatus,
  ProjectLinkType,
  ProjectStatus,
} from "./types";

export type ProjectActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    title?: string;
    slug?: string;
    summary?: string;
    description?: string;
    status?: string;
    publicationStatus?: string;
    tags?: string;
    startedAt?: string;
    releasedAt?: string;
    sortOrder?: string;
    members?: string;
    links?: string;
  };
};

export type ProjectMemberInput = {
  name: string;
  role: string;
  sortOrder: number;
};

export type ProjectLinkInput = {
  type: ProjectLinkType;
  label: string;
  href: string;
  sortOrder: number;
};

export type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  publicationStatus: ContentStatus;
  tags: string[];
  featured: boolean;
  startedAt?: string;
  releasedAt?: string;
  sortOrder: number;
  members: ProjectMemberInput[];
  links: ProjectLinkInput[];
};

const projectStatuses = new Set<ProjectStatus>([
  "planning",
  "developing",
  "released",
  "archived",
]);
const contentStatuses = new Set<ContentStatus>([
  "draft",
  "published",
  "archived",
]);
const linkTypes = new Set<ProjectLinkType>([
  "github",
  "website",
  "download",
  "youtube",
  "steam",
  "itchio",
]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function isRealDate(value: string): boolean {
  if (!datePattern.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseTags(value: string): string[] {
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return Array.from(new Set(tags)).slice(0, 12);
}

function parseMembers(value: string): ProjectMemberInput[] {
  return value
    .split(/\r?\n/)
    .map((line, index) => {
      const [name, role] = line.split("|").map((part) => part?.trim() ?? "");

      return { name, role, sortOrder: index };
    })
    .filter((member) => member.name || member.role);
}

function parseLinks(value: string): ProjectLinkInput[] {
  return value
    .split(/\r?\n/)
    .map((line, index) => {
      const [type, label, href] = line.split("|").map((part) => part?.trim() ?? "");

      return {
        type: type as ProjectLinkType,
        label,
        href,
        sortOrder: index,
      };
    })
    .filter((link) => link.type || link.label || link.href);
}

function isSafeProjectUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateProjectFormData(formData: FormData):
  | { ok: true; values: ProjectFormValues }
  | { ok: false; state: ProjectActionState } {
  const id = readString(formData, "id").trim();
  const title = readString(formData, "title").trim();
  const slug = readString(formData, "slug").trim();
  const summary = readString(formData, "summary").trim();
  const description = readString(formData, "description").trim();
  const status = readString(formData, "status") as ProjectStatus;
  const publicationStatus = readString(
    formData,
    "publicationStatus",
  ) as ContentStatus;
  const featured = formData.get("featured") === "on";
  const startedAt = readString(formData, "startedAt").trim();
  const releasedAt = readString(formData, "releasedAt").trim();
  const sortOrderRaw = readString(formData, "sortOrder").trim();
  const tags = parseTags(readString(formData, "tags"));
  const members = parseMembers(readString(formData, "members"));
  const links = parseLinks(readString(formData, "links"));
  const sortOrder = Number.parseInt(sortOrderRaw || "0", 10);
  const fieldErrors: NonNullable<ProjectActionState["fieldErrors"]> = {};

  if (id && !uuidPattern.test(id)) fieldErrors.slug = "프로젝트 id가 올바르지 않습니다.";
  if (!title || title.length > 120) fieldErrors.title = "제목은 1~120자로 입력해 주세요.";
  if (!slugPattern.test(slug) || slug.length > 120) {
    fieldErrors.slug = "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.";
  }
  if (!summary || summary.length > 300) {
    fieldErrors.summary = "요약은 1~300자로 입력해 주세요.";
  }
  if (!description || description.length > 5000) {
    fieldErrors.description = "설명은 1~5000자로 입력해 주세요.";
  }
  if (!projectStatuses.has(status)) fieldErrors.status = "개발 상태를 확인해 주세요.";
  if (!contentStatuses.has(publicationStatus)) {
    fieldErrors.publicationStatus = "공개 상태를 확인해 주세요.";
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    fieldErrors.sortOrder = "정렬 순서는 0 이상의 숫자여야 합니다.";
  }
  if (startedAt && !isRealDate(startedAt)) {
    fieldErrors.startedAt = "시작일은 YYYY-MM-DD 형식이어야 합니다.";
  }
  if (releasedAt && !isRealDate(releasedAt)) {
    fieldErrors.releasedAt = "공개일은 YYYY-MM-DD 형식이어야 합니다.";
  }
  if (startedAt && releasedAt && releasedAt < startedAt) {
    fieldErrors.releasedAt = "공개일은 시작일보다 빠를 수 없습니다.";
  }
  if (tags.some((tag) => tag.length > 30)) {
    fieldErrors.tags = "태그는 각각 30자 이하로 입력해 주세요.";
  }
  if (members.length > 20 || members.some((member) => !member.name || !member.role)) {
    fieldErrors.members = "멤버는 한 줄에 이름|역할 형식으로 입력해 주세요.";
  }
  if (
    links.length > 12 ||
    links.some(
      (link) =>
        !linkTypes.has(link.type) ||
        !link.label ||
        !link.href ||
        !isSafeProjectUrl(link.href),
    )
  ) {
    fieldErrors.links = "링크는 한 줄에 type|label|https://url 형식으로 입력해 주세요.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "입력한 프로젝트 정보를 확인해 주세요.",
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
      description,
      status,
      publicationStatus,
      tags,
      featured,
      startedAt: startedAt || undefined,
      releasedAt: releasedAt || undefined,
      sortOrder,
      members,
      links,
    },
  };
}
