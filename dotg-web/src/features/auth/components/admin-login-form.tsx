"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { loginAction } from "../actions";
import type { LoginActionState } from "../types";
import { LoginSubmitButton } from "./login-submit-button";

const initialState: LoginActionState = {
  status: "idle",
};

type AdminLoginFormProps = {
  nextPath?: string;
  disabled?: boolean;
};

export function AdminLoginForm({
  nextPath = "/admin",
  disabled = false,
}: AdminLoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const emailErrorId = state.fieldErrors?.email ? "admin-email-error" : undefined;
  const passwordErrorId = state.fieldErrors?.password
    ? "admin-password-error"
    : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <input name="next" type="hidden" value={nextPath} />
      <FormField
        error={state.fieldErrors?.email}
        htmlFor="admin-email"
        label="이메일"
        required
      >
        <Input
          aria-describedby={emailErrorId}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          disabled={disabled}
          id="admin-email"
          name="email"
          required
          type="email"
        />
      </FormField>
      <FormField
        error={state.fieldErrors?.password}
        htmlFor="admin-password"
        label="비밀번호"
        required
      >
        <Input
          aria-describedby={passwordErrorId}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete="current-password"
          disabled={disabled}
          id="admin-password"
          name="password"
          required
          type="password"
        />
      </FormField>
      <LoginSubmitButton />
      <p className="text-sm leading-6 text-neutral-500" role="status">
        {state.message ??
          (disabled
            ? "Supabase 인증 환경이 설정되지 않았습니다."
            : "관리자 계정으로 로그인해 주세요.")}
      </p>
    </form>
  );
}
