import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-[#5d4fea] border-transparent",
  secondary:
    "bg-surface text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 border-border",
  ghost:
    "bg-transparent text-foreground hover:bg-surface border-transparent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function buttonClasses({
  className,
  variant = "primary",
  size = "md",
}: {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses({ className, variant, size })}
      type={type}
      {...props}
    />
  );
}
