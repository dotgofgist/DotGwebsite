import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function RecruitmentCtaSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold text-primary">모집 안내</p>
            <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              게임 제작에 관심이 있다면 모집 안내를 확인해 보세요
            </h2>
            <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              모집 일정과 지원 방법은 모집 페이지에서 안내합니다. 현재
              지원 링크는 해당 페이지에서 확인할 수 있도록 준비 중입니다.
            </p>
          </div>
          <div className="mt-6 lg:mt-0">
            <Link className={buttonClasses({ size: "lg" })} href="/recruitment">
              모집 페이지로 이동
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
