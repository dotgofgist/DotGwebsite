"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "../actions";

type ProjectDeleteFormProps = {
  id: string;
  slug: string;
  title: string;
};

export function ProjectDeleteForm({ id, slug, title }: ProjectDeleteFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        size="sm"
        type="button"
        variant="danger"
      >
        삭제
      </Button>
      {open ? (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-sm font-semibold">{title} 삭제</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            삭제하면 프로젝트와 멤버, 링크가 함께 제거됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setOpen(false)} size="sm" type="button" variant="secondary">
              취소
            </Button>
            <form action={deleteProjectAction}>
              <input name="id" type="hidden" value={id} />
              <input name="slug" type="hidden" value={slug} />
              <Button size="sm" type="submit" variant="danger">
                삭제 확인
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
