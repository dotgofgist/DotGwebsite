"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSocialLinkAction, updateSocialLinkAction } from "../actions";
import type { AdminSocialLink } from "../types";
import type { SocialLinkActionState } from "../validation";
import { SettingsSubmitButton } from "./settings-submit-button";

type SocialLinkFormProps = {
  initialSocialLink?: AdminSocialLink;
  mode: "create" | "edit";
};

const initialState: SocialLinkActionState = {
  status: "idle",
};

export function SocialLinkForm({
  initialSocialLink,
  mode,
}: SocialLinkFormProps) {
  const action = mode === "create" ? createSocialLinkAction : updateSocialLinkAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-border bg-surface p-6">
      {initialSocialLink ? (
        <input name="id" type="hidden" value={initialSocialLink.id} />
      ) : null}
      {state.message ? (
        <p className="rounded-md border border-border bg-background p-3 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.platform} htmlFor="social-platform" label="플랫폼" description="예: github, instagram, youtube" required>
          <Input id="social-platform" name="platform" required defaultValue={initialSocialLink?.platform ?? ""} />
        </FormField>
        <FormField error={state.fieldErrors?.label} htmlFor="social-label" label="표시 라벨" required>
          <Input id="social-label" name="label" required defaultValue={initialSocialLink?.label ?? ""} />
        </FormField>
      </div>
      <FormField
        error={state.fieldErrors?.url}
        htmlFor="social-url"
        label="URL"
        description="활성 SNS 링크에는 http 또는 https URL이 필요합니다."
      >
        <Input id="social-url" name="url" type="url" defaultValue={initialSocialLink?.url ?? ""} />
      </FormField>
      <FormField error={state.fieldErrors?.description} htmlFor="social-description" label="설명">
        <Textarea id="social-description" name="description" defaultValue={initialSocialLink?.description ?? ""} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.sortOrder} htmlFor="social-sort-order" label="정렬 순서">
          <Input
            id="social-sort-order"
            min={0}
            name="sortOrder"
            type="number"
            defaultValue={initialSocialLink?.sortOrder ?? 0}
          />
        </FormField>
        <div className="flex items-center gap-3 pt-7">
          <Checkbox id="social-is-active" name="isActive" defaultChecked={initialSocialLink?.isActive ?? false} />
          <label className="text-sm font-medium" htmlFor="social-is-active">
            공개 SNS 링크로 표시
          </label>
        </div>
      </div>
      <SettingsSubmitButton label={mode === "create" ? "SNS 링크 생성" : "SNS 링크 저장"} />
    </form>
  );
}
