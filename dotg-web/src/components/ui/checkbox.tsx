import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      className={cn("size-4 rounded border-border accent-[var(--primary)]", className)}
      type="checkbox"
      {...props}
    />
  );
}
