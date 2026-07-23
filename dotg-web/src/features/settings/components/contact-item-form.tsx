"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createContactItemAction, updateContactItemAction } from "../actions";
import type { AdminContactItem } from "../types";
import type { ContactItemActionState } from "../validation";
import { SettingsSubmitButton } from "./settings-submit-button";

type ContactItemFormProps = {
  initialContactItem?: AdminContactItem;
  mode: "create" | "edit";
};

const initialState: ContactItemActionState = {
  status: "idle",
};

export function ContactItemForm({
  initialContactItem,
  mode,
}: ContactItemFormProps) {
  const action =
    mode === "create" ? createContactItemAction : updateContactItemAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-border bg-surface p-6">
      {initialContactItem ? (
        <input name="id" type="hidden" value={initialContactItem.id} />
      ) : null}
      {state.message ? (
        <p className="rounded-md border border-border bg-background p-3 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.label} htmlFor="contact-label" label="연락처 라벨" required>
          <Input id="contact-label" name="label" required defaultValue={initialContactItem?.label ?? ""} />
        </FormField>
        <FormField error={state.fieldErrors?.value} htmlFor="contact-value" label="표시 값" required>
          <Input id="contact-value" name="value" required defaultValue={initialContactItem?.value ?? ""} />
        </FormField>
      </div>
      <FormField
        error={state.fieldErrors?.href}
        htmlFor="contact-href"
        label="링크"
        description="http, https, mailto 주소만 사용할 수 있습니다."
      >
        <Input id="contact-href" name="href" defaultValue={initialContactItem?.href ?? ""} />
      </FormField>
      <FormField error={state.fieldErrors?.description} htmlFor="contact-description" label="설명">
        <Textarea id="contact-description" name="description" defaultValue={initialContactItem?.description ?? ""} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField error={state.fieldErrors?.sortOrder} htmlFor="contact-sort-order" label="정렬 순서">
          <Input
            id="contact-sort-order"
            min={0}
            name="sortOrder"
            type="number"
            defaultValue={initialContactItem?.sortOrder ?? 0}
          />
        </FormField>
        <div className="flex items-center gap-3 pt-7">
          <Checkbox id="contact-is-active" name="isActive" defaultChecked={initialContactItem?.isActive ?? true} />
          <label className="text-sm font-medium" htmlFor="contact-is-active">
            공개 연락처로 표시
          </label>
        </div>
      </div>
      <SettingsSubmitButton label={mode === "create" ? "연락처 생성" : "연락처 저장"} />
    </form>
  );
}
