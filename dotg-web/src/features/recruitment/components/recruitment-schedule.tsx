import { Card, CardContent } from "@/components/ui/card";
import { formatDateRange } from "@/lib/utils/date";
import type { Recruitment } from "../types";

type RecruitmentScheduleProps = {
  recruitment: Recruitment;
};

export function RecruitmentSchedule({
  recruitment,
}: RecruitmentScheduleProps) {
  const schedule = formatDateRange(
    recruitment.schedule.startsAt,
    recruitment.schedule.endsAt,
  );

  return (
    <section className="py-12">
      <Card>
        <CardContent className="space-y-3 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-normal">모집 일정</h2>
          {schedule ? (
            <p className="text-base font-medium">{schedule}</p>
          ) : (
            <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              정확한 모집 일정은 추후 공지사항을 통해 안내합니다.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
