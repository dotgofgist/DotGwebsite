"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteSocialLinkAction } from "../actions";

type SocialLinkDeleteFormProps = {
  id: string;
  label: string;
};

export function SocialLinkDeleteForm({ id, label }: SocialLinkDeleteFormProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={deleteSocialLinkAction} className="space-y-2">
      <input name="id" type="hidden" value={id} />
      {confirming ? (
        <div className="rounded-md border border-border bg-background p-3 text-sm leading-6">
          <p className="font-semibold">{label} SNS 링크를 영구 삭제합니다.</p>
          <p className="text-neutral-500">공개에서만 숨기려면 비활성화를 사용하세요.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setConfirming(false)} type="button" variant="secondary">
              취소
            </Button>
            <Button aria-label={`${label} SNS 링크 영구 삭제`} type="submit" variant="danger">
              삭제
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setConfirming(true)} type="button" variant="danger">
          삭제
        </Button>
      )}
    </form>
  );
}
