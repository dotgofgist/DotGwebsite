"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => void;
};

export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel = "삭제 확인",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <Button
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        size="sm"
        type="button"
        variant="danger"
      >
        {triggerLabel}
      </Button>
      {open ? (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-neutral-400">
            {description}
          </p>
          {!onConfirm ? (
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              삭제 기능은 데이터베이스 연결 후 활성화됩니다.
            </p>
          ) : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setOpen(false)} size="sm" type="button" variant="secondary">
              취소
            </Button>
            <Button
              disabled={!onConfirm}
              onClick={onConfirm}
              size="sm"
              type="button"
              variant="danger"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
