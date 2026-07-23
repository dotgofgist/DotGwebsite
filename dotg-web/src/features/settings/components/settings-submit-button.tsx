"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SettingsSubmitButtonProps = {
  label: string;
};

export function SettingsSubmitButton({ label }: SettingsSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} disabled={pending} type="submit">
      {pending ? "저장 중" : label}
    </Button>
  );
}
