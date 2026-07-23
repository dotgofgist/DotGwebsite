"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  removeSiteLogoAction,
  updateSiteLogoAction,
  type SiteImageActionState,
} from "../image-actions";
import type { AdminSiteSettings } from "../types";
import { SiteImageSubmitButton } from "./site-image-submit-button";
import { SiteLogoPreview } from "./site-logo-preview";

type SiteLogoFormProps = {
  settings: AdminSiteSettings;
};

const initialState: SiteImageActionState = {
  status: "idle",
};

export function SiteLogoForm({ settings }: SiteLogoFormProps) {
  const [state, formAction] = useActionState(updateSiteLogoAction, initialState);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  return (
    <section className="grid gap-5 rounded-lg border border-border bg-surface p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-normal">사이트 로고</h2>
        <p className="mt-1 text-sm leading-6 text-neutral-500">
          JPEG, PNG, WebP 이미지를 2MB 이하로 업로드할 수 있습니다.
        </p>
      </div>
      <SiteLogoPreview settings={settings} />
      <form action={formAction} className="grid gap-4">
        {state.message ? (
          <p
            className="rounded-md border border-border bg-background p-3 text-sm text-red-600"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}
        <FormField htmlFor="site-logo-image" label="로고 이미지 파일" required>
          <Input
            accept="image/jpeg,image/png,image/webp"
            aria-invalid={Boolean(state.message)}
            id="site-logo-image"
            name="image"
            required
            type="file"
          />
        </FormField>
        <SiteImageSubmitButton label="로고 이미지 저장" />
      </form>
      {settings.logoPath ? (
        <form action={removeSiteLogoAction} className="space-y-3">
          {confirmingRemove ? (
            <div className="rounded-md border border-border bg-background p-3 text-sm leading-6">
              <p className="font-semibold">사이트 로고를 제거할까요?</p>
              <p className="text-neutral-500">
                Header에는 텍스트 로고 fallback이 표시됩니다.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => setConfirmingRemove(false)}
                  type="button"
                  variant="secondary"
                >
                  취소
                </Button>
                <Button aria-label="사이트 로고 제거" type="submit" variant="danger">
                  제거
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setConfirmingRemove(true)}
              type="button"
              variant="danger"
            >
              로고 제거
            </Button>
          )}
        </form>
      ) : null}
    </section>
  );
}
