"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type NoticeSubmitButtonProps = {
  label: string;
};

export function NoticeSubmitButton({ label }: NoticeSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "저장 중" : label}
    </Button>
  );
}
