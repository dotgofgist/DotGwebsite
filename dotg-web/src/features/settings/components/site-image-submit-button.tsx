"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SiteImageSubmitButtonProps = {
  label: string;
};

export function SiteImageSubmitButton({ label }: SiteImageSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} disabled={pending} type="submit">
      {pending ? "업로드 중" : label}
    </Button>
  );
}
