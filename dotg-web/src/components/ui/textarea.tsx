import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-neutral-500 disabled:bg-surface disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
