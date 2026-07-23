"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createRecruitmentAction, updateRecruitmentAction } from "../actions";
import type { AdminRecruitment } from "../types";
import type { RecruitmentActionState } from "../validation";
import { RecruitmentSubmitButton } from "./recruitment-submit-button";

type RecruitmentFormProps = {
  initialRecruitment?: AdminRecruitment;
  mode: "create" | "edit";
};

const initialState: RecruitmentActionState = {
  status: "idle",
};

function dateValue(value: string | undefined): string {
  return value?.slice(0, 10) ?? "";
}

function lineValue(values: string[] | undefined): string {
  return values?.join("\n") ?? "";
}

function processValue(recruitment: AdminRecruitment | undefined): string {
  return (
    recruitment?.process
      .map((step) => `${step.title}|${step.description}`)
      .join("\n") ?? ""
  );
}

export function RecruitmentForm({
  initialRecruitment,
  mode,
}: RecruitmentFormProps) {
  const action =
    mode === "create" ? createRecruitmentAction : updateRecruitmentAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-6 rounded-lg border border-border bg-surface p-6">
      {initialRecruitment ? (
        <input name="id" type="hidden" value={initialRecruitment.id} />
      ) : null}
      {state.message ? (
        <p
          className="rounded-md border border-border bg-background p-3 text-sm text-red-600"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      {initialRecruitment ? (
        <p className="rounded-md border border-border bg-background p-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          현재 모집 여부: {initialRecruitment.isCurrent ? "현재 모집으로 지정됨" : "현재 모집 아님"}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.title} htmlFor="recruitment-title" label="모집 제목" required>
          <Input
            aria-invalid={Boolean(state.fieldErrors?.title)}
            id="recruitment-title"
            name="title"
            required
            defaultValue={initialRecruitment?.title ?? ""}
          />
        </FormField>
        <FormField error={state.fieldErrors?.applicationLabel} htmlFor="application-label" label="지원 버튼 라벨" required>
          <Input
            aria-invalid={Boolean(state.fieldErrors?.applicationLabel)}
            id="application-label"
            name="applicationLabel"
            required
            defaultValue={initialRecruitment?.applicationLabel ?? "지원하기"}
          />
        </FormField>
      </div>

      <FormField error={state.fieldErrors?.summary} htmlFor="recruitment-summary" label="요약" required>
        <Textarea
          aria-invalid={Boolean(state.fieldErrors?.summary)}
          id="recruitment-summary"
          name="summary"
          required
          defaultValue={initialRecruitment?.summary ?? ""}
        />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.status} htmlFor="recruitment-status" label="모집 상태" required>
          <Select id="recruitment-status" name="status" defaultValue={initialRecruitment?.status ?? "upcoming"}>
            <option value="upcoming">모집 예정</option>
            <option value="open">모집 중</option>
            <option value="closed">모집 마감</option>
            <option value="always">상시 모집</option>
          </Select>
        </FormField>
        <FormField error={state.fieldErrors?.publicationStatus} htmlFor="recruitment-publication-status" label="공개 상태" required>
          <Select
            id="recruitment-publication-status"
            name="publicationStatus"
            defaultValue={initialRecruitment?.publicationStatus ?? "draft"}
          >
            <option value="draft">초안</option>
            <option value="published">공개</option>
            <option value="archived">보관</option>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.startsAt} htmlFor="starts-at" label="모집 시작일">
          <Input id="starts-at" name="startsAt" type="date" defaultValue={dateValue(initialRecruitment?.schedule.startsAt)} />
        </FormField>
        <FormField error={state.fieldErrors?.endsAt} htmlFor="ends-at" label="모집 종료일">
          <Input id="ends-at" name="endsAt" type="date" defaultValue={dateValue(initialRecruitment?.schedule.endsAt)} />
        </FormField>
      </div>

      <FormField
        error={state.fieldErrors?.applicationUrl}
        htmlFor="application-url"
        label="지원 URL"
        description="실제 외부 지원 URL이 확정된 경우에만 http 또는 https 주소로 입력합니다."
      >
        <Input id="application-url" name="applicationUrl" type="url" defaultValue={initialRecruitment?.applicationUrl ?? ""} />
      </FormField>

      <FormField error={state.fieldErrors?.target} htmlFor="target" label="모집 대상" description="한 줄에 하나씩 입력" required>
        <Textarea id="target" name="target" required defaultValue={lineValue(initialRecruitment?.target)} />
      </FormField>
      <FormField error={state.fieldErrors?.qualifications} htmlFor="qualifications" label="지원 자격" description="한 줄에 하나씩 입력" required>
        <Textarea id="qualifications" name="qualifications" required defaultValue={lineValue(initialRecruitment?.qualifications)} />
      </FormField>
      <FormField error={state.fieldErrors?.activities} htmlFor="activities" label="주요 활동" description="한 줄에 하나씩 입력" required>
        <Textarea id="activities" name="activities" required defaultValue={lineValue(initialRecruitment?.activities)} />
      </FormField>
      <FormField error={state.fieldErrors?.process} htmlFor="process" label="모집 절차" description="한 줄에 제목|설명 형식으로 입력합니다.">
        <Textarea id="process" name="process" defaultValue={processValue(initialRecruitment)} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField error={state.fieldErrors?.contactLabel} htmlFor="contact-label" label="문의 라벨">
          <Input id="contact-label" name="contactLabel" defaultValue={initialRecruitment?.contact?.label ?? ""} />
        </FormField>
        <FormField error={state.fieldErrors?.contactValue} htmlFor="contact-value" label="문의 값">
          <Input id="contact-value" name="contactValue" defaultValue={initialRecruitment?.contact?.value ?? ""} />
        </FormField>
        <FormField error={state.fieldErrors?.contactHref} htmlFor="contact-href" label="문의 URL">
          <Input id="contact-href" name="contactHref" type="url" defaultValue={initialRecruitment?.contact?.href ?? ""} />
        </FormField>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <RecruitmentSubmitButton label={mode === "create" ? "모집 정보 생성" : "모집 정보 저장"} />
        <p className="text-sm leading-6 text-neutral-500">
          저장 시 관리자 권한과 Supabase RLS가 다시 검증됩니다.
        </p>
      </div>
    </form>
  );
}
