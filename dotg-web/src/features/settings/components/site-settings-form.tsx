"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettingsAction } from "../actions";
import type { SiteSettings } from "../types";
import type { SiteSettingsActionState } from "../validation";
import { SettingsSubmitButton } from "./settings-submit-button";

type SiteSettingsFormProps = {
  initialSettings: SiteSettings;
};

const initialState: SiteSettingsActionState = {
  status: "idle",
};

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [state, formAction] = useActionState(
    updateSiteSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold tracking-normal">사이트 기본 정보</h2>
      {state.message ? (
        <p className="rounded-md border border-border bg-background p-3 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
      <FormField error={state.fieldErrors?.name} htmlFor="site-name" label="사이트 이름" required>
        <Input
          aria-invalid={Boolean(state.fieldErrors?.name)}
          id="site-name"
          name="name"
          required
          defaultValue={initialSettings.name}
        />
      </FormField>
      <FormField error={state.fieldErrors?.title} htmlFor="site-title" label="사이트 제목" required>
        <Input
          aria-invalid={Boolean(state.fieldErrors?.title)}
          id="site-title"
          name="title"
          required
          defaultValue={initialSettings.title}
        />
      </FormField>
      <FormField error={state.fieldErrors?.description} htmlFor="site-description" label="사이트 설명" required>
        <Textarea
          aria-invalid={Boolean(state.fieldErrors?.description)}
          id="site-description"
          name="description"
          required
          defaultValue={initialSettings.description}
        />
      </FormField>
      <FormField error={state.fieldErrors?.shortDescription} htmlFor="site-short-description" label="짧은 소개" required>
        <Textarea
          aria-invalid={Boolean(state.fieldErrors?.shortDescription)}
          id="site-short-description"
          name="shortDescription"
          required
          defaultValue={initialSettings.shortDescription}
        />
      </FormField>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SettingsSubmitButton label="사이트 설정 저장" />
        <p className="text-sm leading-6 text-neutral-500">
          저장 시 singleton row `id=1`에 upsert됩니다.
        </p>
      </div>
    </form>
  );
}
