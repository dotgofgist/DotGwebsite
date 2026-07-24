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
    updatedAt?: string;
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
  updatedAt?: string;
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
  if (!datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseTags(value: string): string[] {
  const normalized = new Map<string, string>();
  for (const tag of value.split(",")) {
    const trimmed = tag.trim();
    const key = trimmed.toLowerCase();
    if (trimmed && !normalized.has(key)) normalized.set(key, trimmed);
  }

  return Array.from(normalized.values()).slice(0, 12);
}

function parseMembers(value: string): ProjectMemberInput[] {
  const seen = new Set<string>();
  const members: ProjectMemberInput[] = [];

  for (const line of value.split(/\r?\n/)) {
    const [name = "", role = ""] = line.split("|").map((part) => part.trim());
    if (!name && !role) continue;
    const key = `${name.toLowerCase()}\u0000${role.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    members.push({ name, role, sortOrder: members.length });
  }

  return members;
}

function parseLinks(value: string): ProjectLinkInput[] {
  const seen = new Set<string>();
  const links: ProjectLinkInput[] = [];

  for (const line of value.split(/\r?\n/)) {
    const [type = "", label = "", href = ""] = line.split("|").map((part) => part.trim());
    if (!type && !label && !href) continue;
    const key = href.toLowerCase();
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    links.push({
      type: type as ProjectLinkType,
      label,
      href,
      sortOrder: links.length,
    });
  }

  return links;
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
  const slug = readString(formData, "slug").trim().toLowerCase();
  const summary = readString(formData, "summary").trim();
  const description = readString(formData, "description").trim();
  const status = readString(formData, "status") as ProjectStatus;
  const publicationStatus = readString(formData, "publicationStatus") as ContentStatus;
  const featured = formData.get("featured") === "on";
  const startedAt = readString(formData, "startedAt").trim();
  const releasedAt = readString(formData, "releasedAt").trim();
  const sortOrderRaw = readString(formData, "sortOrder").trim();
  const updatedAt = readString(formData, "updatedAt").trim();
  const tags = parseTags(readString(formData, "tags"));
  const members = parseMembers(readString(formData, "members"));
  const links = parseLinks(readString(formData, "links"));
  const sortOrder = Number.parseInt(sortOrderRaw || "0", 10);
  const fieldErrors: NonNullable<ProjectActionState["fieldErrors"]> = {};

  if (id && !uuidPattern.test(id)) fieldErrors.slug = "Invalid project id.";
  if (id && !updatedAt) fieldErrors.updatedAt = "Refresh this project before saving again.";
  if (!title || title.length > 120) fieldErrors.title = "Title must be 1-120 characters.";
  if (!slugPattern.test(slug) || slug.length > 120) {
    fieldErrors.slug = "Slug must use lowercase letters, numbers, and single hyphens.";
  }
  if (!summary || summary.length > 300) fieldErrors.summary = "Summary must be 1-300 characters.";
  if (!description || description.length > 5000) {
    fieldErrors.description = "Description must be 1-5000 characters.";
  }
  if (!projectStatuses.has(status)) fieldErrors.status = "Choose a valid project status.";
  if (!contentStatuses.has(publicationStatus)) {
    fieldErrors.publicationStatus = "Choose a valid publication status.";
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    fieldErrors.sortOrder = "Sort order must be a non-negative integer.";
  }
  if (startedAt && !isRealDate(startedAt)) fieldErrors.startedAt = "Use YYYY-MM-DD.";
  if (releasedAt && !isRealDate(releasedAt)) fieldErrors.releasedAt = "Use YYYY-MM-DD.";
  if (startedAt && releasedAt && releasedAt < startedAt) {
    fieldErrors.releasedAt = "Release date cannot be earlier than start date.";
  }
  if (tags.some((tag) => tag.length > 30)) {
    fieldErrors.tags = "Each tag must be 30 characters or shorter.";
  }
  if (members.length > 20 || members.some((member) => !member.name || !member.role)) {
    fieldErrors.members = "Enter members as name|role, one per line.";
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
    fieldErrors.links = "Enter links as type|label|https://url, one per line.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Check the project form fields.",
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
      updatedAt: updatedAt || undefined,
    },
  };
}
