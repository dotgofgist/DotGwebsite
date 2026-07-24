"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type ProjectSubmitButtonProps = {
  label: string;
};

export function ProjectSubmitButton({ label }: ProjectSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} disabled={pending} type="submit">
      {pending ? "Saving..." : label}
    </Button>
  );
}
