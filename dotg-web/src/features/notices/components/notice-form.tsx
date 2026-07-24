"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createNoticeAction, updateNoticeAction } from "../actions";
import type { AdminNotice } from "../types";
import type { NoticeActionState } from "../validation";
import { NoticeSubmitButton } from "./notice-submit-button";

type NoticeFormProps = {
  initialNotice?: AdminNotice;
  mode: "create" | "edit";
};

const initialState: NoticeActionState = {
  status: "idle",
};

export function NoticeForm({ initialNotice, mode }: NoticeFormProps) {
  const action = mode === "create" ? createNoticeAction : updateNoticeAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-6 rounded-lg border border-border bg-surface p-6">
      {initialNotice ? <input name="id" type="hidden" value={initialNotice.id} /> : null}
      {initialNotice ? <input name="updatedAt" type="hidden" value={initialNotice.updatedAt} /> : null}
      {state.message ? (
        <p className="rounded-md border border-border bg-background p-3 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.title} htmlFor="notice-title" label="공지 제목" required>
          <Input id="notice-title" name="title" required defaultValue={initialNotice?.title ?? ""} />
        </FormField>
        <FormField error={state.fieldErrors?.slug} htmlFor="notice-slug" label="slug" required>
          <Input id="notice-slug" name="slug" required defaultValue={initialNotice?.slug ?? ""} />
        </FormField>
      </div>

      <FormField error={state.fieldErrors?.summary} htmlFor="notice-summary" label="요약" required>
        <Textarea id="notice-summary" name="summary" required defaultValue={initialNotice?.summary ?? ""} />
      </FormField>
      <FormField
        description="plain text로 입력합니다. 빈 줄은 문단 구분으로 사용됩니다."
        error={state.fieldErrors?.content}
        htmlFor="notice-content"
        label="본문"
        required
      >
        <Textarea id="notice-content" name="content" required defaultValue={initialNotice?.content ?? ""} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          error={state.fieldErrors?.publicationStatus}
          htmlFor="notice-publication-status"
          label="공개 상태"
        >
          <Select
            id="notice-publication-status"
            name="publicationStatus"
            defaultValue={initialNotice?.publicationStatus ?? "draft"}
          >
            <option value="draft">초안</option>
            <option value="published">공개</option>
            <option value="archived">보관</option>
          </Select>
        </FormField>
        <div className="flex items-center gap-3 pt-7">
          <Checkbox id="notice-pinned" name="pinned" defaultChecked={initialNotice?.pinned ?? false} />
          <label className="text-sm font-medium" htmlFor="notice-pinned">
            고정 공지로 표시
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <NoticeSubmitButton label={mode === "create" ? "공지사항 생성" : "공지사항 저장"} />
        <p className="text-sm leading-6 text-neutral-500">
          저장 시 관리자 권한과 Supabase RLS가 다시 검증됩니다.
        </p>
      </div>
    </form>
  );
}
