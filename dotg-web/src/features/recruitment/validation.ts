import type {
  ContentStatus,
  RecruitmentStatus,
  RecruitmentStep,
} from "./types";

export type RecruitmentActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    title?: string;
    summary?: string;
    status?: string;
    publicationStatus?: string;
    target?: string;
    qualifications?: string;
    activities?: string;
    startsAt?: string;
    endsAt?: string;
    applicationLabel?: string;
    applicationUrl?: string;
    process?: string;
    contactLabel?: string;
    contactValue?: string;
    contactHref?: string;
  };
};

export type RecruitmentStepInput = RecruitmentStep & {
  sortOrder: number;
};

export type RecruitmentFormValues = {
  id?: string;
  title: string;
  summary: string;
  status: RecruitmentStatus;
  publicationStatus: ContentStatus;
  target: string[];
  qualifications: string[];
  activities: string[];
  startsAt?: string;
  endsAt?: string;
  applicationLabel: string;
  applicationUrl?: string;
  process: RecruitmentStepInput[];
  contactLabel?: string;
  contactValue?: string;
  contactHref?: string;
};

const recruitmentStatuses = new Set<RecruitmentStatus>([
  "upcoming",
  "open",
  "closed",
  "always",
]);
const contentStatuses = new Set<ContentStatus>([
  "draft",
  "published",
  "archived",
]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const controlCharacterPattern = /[\u0000-\u001f\u007f]/;

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function parseLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function parseProcess(value: string): RecruitmentStepInput[] {
  return value
    .split(/\r?\n/)
    .map((line, index) => {
      const [title, description] = line
        .split("|")
        .map((part) => part?.trim() ?? "");

      return { title, description, sortOrder: index };
    })
    .filter((step) => step.title || step.description)
    .slice(0, 20);
}

function isRealDate(value: string): boolean {
  if (!datePattern.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toIsoDateStart(value?: string): string | undefined {
  return value ? `${value}T00:00:00.000Z` : undefined;
}

function toIsoDateEnd(value?: string): string | undefined {
  return value ? `${value}T23:59:59.000Z` : undefined;
}

function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isPlainText(value: string): boolean {
  return !controlCharacterPattern.test(value);
}

export function validateRecruitmentFormData(formData: FormData):
  | { ok: true; values: RecruitmentFormValues }
  | { ok: false; state: RecruitmentActionState } {
  const id = readString(formData, "id").trim();
  const title = readString(formData, "title").trim();
  const summary = readString(formData, "summary").trim();
  const status = readString(formData, "status") as RecruitmentStatus;
  const publicationStatus = readString(
    formData,
    "publicationStatus",
  ) as ContentStatus;
  const target = parseLines(readString(formData, "target"));
  const qualifications = parseLines(readString(formData, "qualifications"));
  const activities = parseLines(readString(formData, "activities"));
  const startsAt = readString(formData, "startsAt").trim();
  const endsAt = readString(formData, "endsAt").trim();
  const applicationLabel = readString(formData, "applicationLabel").trim();
  const applicationUrl = readString(formData, "applicationUrl").trim();
  const process = parseProcess(readString(formData, "process"));
  const contactLabel = readString(formData, "contactLabel").trim();
  const contactValue = readString(formData, "contactValue").trim();
  const contactHref = readString(formData, "contactHref").trim();
  const fieldErrors: NonNullable<RecruitmentActionState["fieldErrors"]> = {};

  if (id && !uuidPattern.test(id)) {
    fieldErrors.title = "모집 정보 id가 올바르지 않습니다.";
  }
  if (!title || title.length > 150 || !isPlainText(title)) {
    fieldErrors.title = "제목은 1~150자의 일반 텍스트로 입력해 주세요.";
  }
  if (!summary || summary.length > 500 || !isPlainText(summary)) {
    fieldErrors.summary = "요약은 1~500자의 일반 텍스트로 입력해 주세요.";
  }
  if (!recruitmentStatuses.has(status)) {
    fieldErrors.status = "모집 상태를 확인해 주세요.";
  }
  if (!contentStatuses.has(publicationStatus)) {
    fieldErrors.publicationStatus = "공개 상태를 확인해 주세요.";
  }
  if (target.length === 0 || target.some((item) => item.length > 120)) {
    fieldErrors.target = "모집 대상은 한 줄에 하나씩, 1개 이상 입력해 주세요.";
  }
  if (
    qualifications.length === 0 ||
    qualifications.some((item) => item.length > 160)
  ) {
    fieldErrors.qualifications = "지원 자격은 한 줄에 하나씩, 1개 이상 입력해 주세요.";
  }
  if (activities.length === 0 || activities.some((item) => item.length > 160)) {
    fieldErrors.activities = "주요 활동은 한 줄에 하나씩, 1개 이상 입력해 주세요.";
  }
  if (startsAt && !isRealDate(startsAt)) {
    fieldErrors.startsAt = "시작일은 YYYY-MM-DD 형식이어야 합니다.";
  }
  if (endsAt && !isRealDate(endsAt)) {
    fieldErrors.endsAt = "종료일은 YYYY-MM-DD 형식이어야 합니다.";
  }
  if (startsAt && endsAt && endsAt < startsAt) {
    fieldErrors.endsAt = "종료일은 시작일보다 빠를 수 없습니다.";
  }
  if (!applicationLabel || applicationLabel.length > 80 || !isPlainText(applicationLabel)) {
    fieldErrors.applicationLabel = "지원 버튼 라벨은 1~80자로 입력해 주세요.";
  }
  if (applicationUrl && !isSafeUrl(applicationUrl)) {
    fieldErrors.applicationUrl = "지원 URL은 http 또는 https 주소만 사용할 수 있습니다.";
  }
  if (
    process.length > 20 ||
    process.some(
      (step) =>
        !step.title ||
        !step.description ||
        step.title.length > 100 ||
        step.description.length > 300,
    )
  ) {
    fieldErrors.process = "절차는 한 줄에 제목|설명 형식으로 입력해 주세요.";
  }
  if (contactLabel && contactLabel.length > 80) {
    fieldErrors.contactLabel = "문의 라벨은 80자 이하로 입력해 주세요.";
  }
  if (contactValue && contactValue.length > 160) {
    fieldErrors.contactValue = "문의 값은 160자 이하로 입력해 주세요.";
  }
  if (contactHref && (!contactValue || !isSafeUrl(contactHref))) {
    fieldErrors.contactHref =
      "문의 링크는 표시 값과 함께 http 또는 https 주소로 입력해 주세요.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "입력한 모집 정보를 확인해 주세요.",
        fieldErrors,
      },
    };
  }

  return {
    ok: true,
    values: {
      id: id || undefined,
      title,
      summary,
      status,
      publicationStatus,
      target,
      qualifications,
      activities,
      startsAt: toIsoDateStart(startsAt),
      endsAt: toIsoDateEnd(endsAt),
      applicationLabel,
      applicationUrl: applicationUrl || undefined,
      process,
      contactLabel: contactLabel || undefined,
      contactValue: contactValue || undefined,
      contactHref: contactHref || undefined,
    },
  };
}
