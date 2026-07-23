import type { Metadata } from "next";
import { RecruitmentContact } from "@/features/recruitment/components/recruitment-contact";
import { RecruitmentGuide } from "@/features/recruitment/components/recruitment-guide";
import { RecruitmentOverview } from "@/features/recruitment/components/recruitment-overview";
import { RecruitmentProcess } from "@/features/recruitment/components/recruitment-process";
import { RecruitmentSchedule } from "@/features/recruitment/components/recruitment-schedule";
import { getCurrentRecruitment } from "@/features/recruitment/queries";

export const metadata: Metadata = {
  title: "모집 안내",
  description: "DotG 게임창작부의 모집 일정과 지원 방법을 안내합니다.",
};

export default async function RecruitmentPage() {
  const recruitment = await getCurrentRecruitment();

  if (!recruitment) {
    return (
      <section className="border-b border-border bg-background py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold text-primary">Recruitment</p>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
              현재 공개된 모집이 없습니다
            </h1>
            <p className="text-base leading-8 text-neutral-600 dark:text-neutral-300">
              새로운 모집 일정과 지원 방법이 확정되면 이 페이지에 공개됩니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <RecruitmentOverview recruitment={recruitment} />
      <RecruitmentSchedule recruitment={recruitment} />
      <RecruitmentGuide recruitment={recruitment} />
      <RecruitmentProcess recruitment={recruitment} />
      <RecruitmentContact recruitment={recruitment} />
    </>
  );
}
