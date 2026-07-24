"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type LoginSubmitButtonProps = {
  disabled?: boolean;
};

export function LoginSubmitButton({ disabled = false }: LoginSubmitButtonProps) {
  const { pending } = useFormStatus();
  const unavailable = disabled || pending;

  return (
    <Button
      aria-disabled={unavailable}
      className="w-full"
      disabled={unavailable}
      type="submit"
    >
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}
