import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = ComponentPropsWithoutRef<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors placeholder:text-neutral-500 disabled:bg-surface disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
