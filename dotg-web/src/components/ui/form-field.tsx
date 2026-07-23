import type { ReactNode } from "react";
import { Label } from "./label";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  children,
}: FormFieldProps) {
  const descriptionId = description ? `${htmlFor}-description` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </Label>
      {children}
      {description ? (
        <p className="text-xs leading-5 text-neutral-500" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs leading-5 text-red-600" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
