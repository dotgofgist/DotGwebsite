import { Badge } from "@/components/ui/badge";
import type { RecruitmentStatus as RecruitmentStatusValue } from "../types";

const statusLabels: Record<RecruitmentStatusValue, string> = {
  upcoming: "모집 예정",
  open: "모집 중",
  closed: "모집 마감",
  always: "상시 모집",
};

const statusDescriptions: Record<RecruitmentStatusValue, string> = {
  upcoming: "현재 모집 일정을 준비하고 있습니다.",
  open: "현재 지원을 받고 있습니다.",
  closed: "현재 모집이 마감되었습니다.",
  always: "정해진 기간 없이 지원 안내를 확인할 수 있습니다.",
};

const statusTones: Record<
  RecruitmentStatusValue,
  "default" | "primary" | "success" | "warning"
> = {
  upcoming: "warning",
  open: "success",
  closed: "default",
  always: "primary",
};

export function getRecruitmentStatusLabel(
  status: RecruitmentStatusValue,
): string {
  return statusLabels[status];
}

export function getRecruitmentStatusDescription(
  status: RecruitmentStatusValue,
): string {
  return statusDescriptions[status];
}

type RecruitmentStatusProps = {
  status: RecruitmentStatusValue;
  showDescription?: boolean;
};

export function RecruitmentStatus({
  status,
  showDescription = false,
}: RecruitmentStatusProps) {
  return (
    <div className="space-y-2">
      <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>
      {showDescription ? (
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          {statusDescriptions[status]}
        </p>
      ) : null}
    </div>
  );
}
