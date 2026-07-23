"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteNoticeAction } from "../actions";

type NoticeDeleteFormProps = {
  id: string;
  slug: string;
  title: string;
};

export function NoticeDeleteForm({ id, slug, title }: NoticeDeleteFormProps) {
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
            삭제하면 공지사항이 영구적으로 제거됩니다. 보관 상태와 다르게 공개/관리 목록에서 모두 사라집니다.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setOpen(false)} size="sm" type="button" variant="secondary">
              취소
            </Button>
            <form action={deleteNoticeAction}>
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
