"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} className="w-full" disabled={pending} type="submit">
      {pending ? "로그인 중" : "로그인"}
    </Button>
  );
}
