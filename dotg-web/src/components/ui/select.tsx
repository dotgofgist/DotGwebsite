import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = ComponentPropsWithoutRef<"select">;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground disabled:bg-surface disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
