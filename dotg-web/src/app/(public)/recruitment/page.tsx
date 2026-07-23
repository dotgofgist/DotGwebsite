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

export default function RecruitmentPage() {
  const recruitment = getCurrentRecruitment();

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
