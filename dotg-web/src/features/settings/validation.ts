export type SiteSettingsActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
    title?: string;
    description?: string;
    shortDescription?: string;
    updatedAt?: string;
  };
};

export type ContactItemActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    label?: string;
    value?: string;
    href?: string;
    description?: string;
    sortOrder?: string;
  };
};

export type SocialLinkActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    platform?: string;
    label?: string;
    url?: string;
    description?: string;
    sortOrder?: string;
  };
};

export type SiteSettingsFormValues = {
  name: string;
  title: string;
  description: string;
  shortDescription: string;
  updatedAt?: string;
};

export type ContactItemFormValues = {
  id?: string;
  label: string;
  value: string;
  href?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
};

export type SocialLinkFormValues = {
  id?: string;
  platform: string;
  label: string;
  url?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
};

export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const platformPattern = /^[a-z0-9][a-z0-9-]{0,39}$/;
const controlCharacterPattern = /[\u0000-\u001f\u007f]/;

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function readSortOrder(formData: FormData): number {
  return Number.parseInt(readString(formData, "sortOrder").trim() || "0", 10);
}

function isPlainText(value: string): boolean {
  return !controlCharacterPattern.test(value);
}

function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSiteSettingsFormData(formData: FormData):
  | { ok: true; values: SiteSettingsFormValues }
  | { ok: false; state: SiteSettingsActionState } {
  const name = readString(formData, "name").trim();
  const title = readString(formData, "title").trim();
  const description = readString(formData, "description").trim();
  const shortDescription = readString(formData, "shortDescription").trim();
  const updatedAt = readString(formData, "updatedAt").trim();
  const fieldErrors: NonNullable<SiteSettingsActionState["fieldErrors"]> = {};

  if (!updatedAt) {
    fieldErrors.updatedAt = "Refresh site settings before saving again.";
  }
  if (!name || name.length > 80 || !isPlainText(name)) {
    fieldErrors.name = "사이트 이름은 1~80자의 일반 텍스트로 입력해 주세요.";
  }
  if (!title || title.length > 120 || !isPlainText(title)) {
    fieldErrors.title = "사이트 제목은 1~120자의 일반 텍스트로 입력해 주세요.";
  }
  if (!description || description.length > 1000 || !isPlainText(description)) {
    fieldErrors.description = "사이트 설명은 1~1000자의 일반 텍스트로 입력해 주세요.";
  }
  if (
    !shortDescription ||
    shortDescription.length > 300 ||
    !isPlainText(shortDescription)
  ) {
    fieldErrors.shortDescription = "짧은 소개는 1~300자의 일반 텍스트로 입력해 주세요.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "사이트 설정 입력값을 확인해 주세요.",
        fieldErrors,
      },
    };
  }

  return { ok: true, values: { name, title, description, shortDescription, updatedAt } };
}

export function validateContactItemFormData(formData: FormData):
  | { ok: true; values: ContactItemFormValues }
  | { ok: false; state: ContactItemActionState } {
  const id = readString(formData, "id").trim();
  const label = readString(formData, "label").trim();
  const value = readString(formData, "value").trim();
  const href = readString(formData, "href").trim();
  const description = readString(formData, "description").trim();
  const isActive = formData.get("isActive") === "on";
  const sortOrder = readSortOrder(formData);
  const fieldErrors: NonNullable<ContactItemActionState["fieldErrors"]> = {};

  if (id && !uuidPattern.test(id)) {
    fieldErrors.label = "연락처 id가 올바르지 않습니다.";
  }
  if (!label || label.length > 80 || !isPlainText(label)) {
    fieldErrors.label = "라벨은 1~80자의 일반 텍스트로 입력해 주세요.";
  }
  if (!value || value.length > 160 || !isPlainText(value)) {
    fieldErrors.value = "표시 값은 1~160자의 일반 텍스트로 입력해 주세요.";
  }
  if (href && !isSafeUrl(href)) {
    fieldErrors.href = "링크는 http, https, mailto 주소만 사용할 수 있습니다.";
  }
  if (description.length > 300 || !isPlainText(description)) {
    fieldErrors.description = "설명은 300자 이하의 일반 텍스트로 입력해 주세요.";
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    fieldErrors.sortOrder = "정렬 순서는 0 이상의 숫자여야 합니다.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "연락처 입력값을 확인해 주세요.",
        fieldErrors,
      },
    };
  }

  return {
    ok: true,
    values: {
      id: id || undefined,
      label,
      value,
      href: href || undefined,
      description: description || undefined,
      isActive,
      sortOrder,
    },
  };
}

export function validateSocialLinkFormData(formData: FormData):
  | { ok: true; values: SocialLinkFormValues }
  | { ok: false; state: SocialLinkActionState } {
  const id = readString(formData, "id").trim();
  const platform = readString(formData, "platform").trim().toLowerCase();
  const label = readString(formData, "label").trim();
  const url = readString(formData, "url").trim();
  const description = readString(formData, "description").trim();
  const isActive = formData.get("isActive") === "on";
  const sortOrder = readSortOrder(formData);
  const fieldErrors: NonNullable<SocialLinkActionState["fieldErrors"]> = {};

  if (id && !uuidPattern.test(id)) {
    fieldErrors.platform = "SNS 링크 id가 올바르지 않습니다.";
  }
  if (!platformPattern.test(platform)) {
    fieldErrors.platform = "플랫폼은 영문 소문자, 숫자, 하이픈으로 입력해 주세요.";
  }
  if (!label || label.length > 80 || !isPlainText(label)) {
    fieldErrors.label = "표시 라벨은 1~80자의 일반 텍스트로 입력해 주세요.";
  }
  if (url && !isSafeHttpUrl(url)) {
    fieldErrors.url = "SNS URL은 http 또는 https 주소만 사용할 수 있습니다.";
  }
  if (isActive && !url) {
    fieldErrors.url = "활성 SNS 링크에는 URL이 필요합니다.";
  }
  if (description.length > 300 || !isPlainText(description)) {
    fieldErrors.description = "설명은 300자 이하의 일반 텍스트로 입력해 주세요.";
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    fieldErrors.sortOrder = "정렬 순서는 0 이상의 숫자여야 합니다.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "SNS 링크 입력값을 확인해 주세요.",
        fieldErrors,
      },
    };
  }

  return {
    ok: true,
    values: {
      id: id || undefined,
      platform,
      label,
      url: url || undefined,
      description: description || undefined,
      isActive,
      sortOrder,
    },
  };
}
