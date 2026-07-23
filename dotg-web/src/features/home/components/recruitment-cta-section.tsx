import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ApplicationButton } from "@/features/recruitment/components/application-button";
import { RecruitmentStatus } from "@/features/recruitment/components/recruitment-status";
import { getCurrentRecruitment } from "@/features/recruitment/queries";

export async function RecruitmentCtaSection() {
  const recruitment = await getCurrentRecruitment();
  const hasDirectApplication = Boolean(recruitment?.applicationUrl);

  return (
    <section className="py-16">
      <Container>
        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl space-y-3">
            {recruitment ? <RecruitmentStatus status={recruitment.status} /> : null}
            <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              {recruitment?.title ?? "현재 공개된 모집이 없습니다"}
            </h2>
            <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              {recruitment?.summary ??
                "새 모집 일정이 확정되면 이 영역과 모집 안내 페이지에 함께 표시됩니다."}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 lg:mt-0">
            <Link className={buttonClasses({ size: "lg" })} href="/recruitment">
              모집 페이지로 이동
            </Link>
            {hasDirectApplication && recruitment ? (
              <ApplicationButton recruitment={recruitment} />
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
