import { buttonClasses, Button } from "@/components/ui/button";
import { isRecruitmentOpen } from "../queries";
import type { Recruitment } from "../types";

type ApplicationButtonProps = {
  recruitment: Recruitment;
};

export function ApplicationButton({ recruitment }: ApplicationButtonProps) {
  const canApply =
    isRecruitmentOpen(recruitment) && Boolean(recruitment.applicationUrl);

  if (canApply && recruitment.applicationUrl) {
    return (
      <div className="space-y-2">
        <a
          aria-label={`${recruitment.applicationLabel} 외부 지원 페이지 새 탭에서 열기`}
          className={buttonClasses({ size: "lg" })}
          href={recruitment.applicationUrl}
          rel="noreferrer noopener"
          target="_blank"
        >
          {recruitment.applicationLabel}
        </a>
        <p className="text-xs text-neutral-500">
          외부 지원 페이지가 새 탭에서 열립니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button disabled size="lg">
        {recruitment.applicationLabel}
      </Button>
      <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        현재 사용할 수 있는 지원 링크가 없습니다. 모집 일정과 지원 방법이
        확정되면 이곳에 안내됩니다.
      </p>
    </div>
  );
}
