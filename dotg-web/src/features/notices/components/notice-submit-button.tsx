"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type NoticeSubmitButtonProps = {
  label: string;
};

export function NoticeSubmitButton({ label }: NoticeSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} disabled={pending} type="submit">
      {pending ? "Saving..." : label}
    </Button>
  );
}
