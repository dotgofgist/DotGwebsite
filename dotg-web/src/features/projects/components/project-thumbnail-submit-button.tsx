"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function ProjectThumbnailSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} disabled={pending} type="submit">
      {pending ? "업로드 중" : "대표 이미지 저장"}
    </Button>
  );
}
