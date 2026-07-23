"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const [message, setMessage] = useState("Supabase Auth 연결 후 활성화됩니다.");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: Supabase Auth 로그인 Server Action 연결
    setMessage("로그인 요청은 아직 전송되지 않습니다. 인증 연결 후 활성화됩니다.");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormField htmlFor="admin-email" label="이메일" required>
        <Input
          autoComplete="email"
          id="admin-email"
          name="email"
          required
          type="email"
        />
      </FormField>
      <FormField htmlFor="admin-password" label="비밀번호" required>
        <Input
          autoComplete="current-password"
          id="admin-password"
          name="password"
          required
          type="password"
        />
      </FormField>
      <Button className="w-full" type="submit">
        로그인
      </Button>
      <p className="text-sm leading-6 text-neutral-500" role="status">
        {message}
      </p>
    </form>
  );
}
