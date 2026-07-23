"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type RecruitmentErrorProps = {
  reset: () => void;
};

export default function RecruitmentError({ reset }: RecruitmentErrorProps) {
  return (
    <Container className="space-y-6 py-16">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold text-primary">Recruitment</p>
        <h1 className="text-3xl font-semibold tracking-normal">
          모집 정보를 불러오지 못했습니다
        </h1>
        <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
          잠시 후 다시 시도하거나 홈으로 돌아가 주세요.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className={buttonClasses()} onClick={reset} type="button">
          다시 시도
        </button>
        <Link className={buttonClasses({ variant: "secondary" })} href="/">
          홈으로
        </Link>
      </div>
    </Container>
  );
}
