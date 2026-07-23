"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type ProjectSubmitButtonProps = {
  label: string;
};

export function ProjectSubmitButton({ label }: ProjectSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "저장 중" : label}
    </Button>
  );
}
