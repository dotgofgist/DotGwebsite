"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type RecruitmentSubmitButtonProps = {
  label: string;
};

export function RecruitmentSubmitButton({ label }: RecruitmentSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} disabled={pending} type="submit">
      {pending ? "Saving..." : label}
    </Button>
  );
}
