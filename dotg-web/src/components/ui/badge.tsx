import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: "default" | "primary" | "success" | "warning";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "border-border bg-surface text-foreground",
  primary: "border-transparent bg-primary text-primary-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
