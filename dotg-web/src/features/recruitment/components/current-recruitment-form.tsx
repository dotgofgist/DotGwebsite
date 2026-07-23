import { Button } from "@/components/ui/button";
import {
  archiveRecruitmentAction,
  setCurrentRecruitmentAction,
  unsetCurrentRecruitmentAction,
} from "../actions";
import type { AdminRecruitment } from "../types";

type CurrentRecruitmentFormProps = {
  recruitment: AdminRecruitment;
};

export function CurrentRecruitmentForm({
  recruitment,
}: CurrentRecruitmentFormProps) {
  if (recruitment.publicationStatus === "archived") {
    return (
      <form action={archiveRecruitmentAction}>
        <input name="id" type="hidden" value={recruitment.id} />
        <Button disabled type="submit" variant="secondary">
          보관됨
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {recruitment.isCurrent ? (
        <form action={unsetCurrentRecruitmentAction}>
          <input name="id" type="hidden" value={recruitment.id} />
          <Button
            aria-label={`${recruitment.title} 현재 모집 지정 해제`}
            type="submit"
            variant="secondary"
          >
            현재 해제
          </Button>
        </form>
      ) : (
        <form action={setCurrentRecruitmentAction}>
          <input name="id" type="hidden" value={recruitment.id} />
          <Button
            aria-label={`${recruitment.title} 현재 모집으로 지정`}
            type="submit"
            variant="secondary"
          >
            현재 지정
          </Button>
        </form>
      )}
      <form action={archiveRecruitmentAction}>
        <input name="id" type="hidden" value={recruitment.id} />
        <Button
          aria-label={`${recruitment.title} 보관 상태로 전환`}
          type="submit"
          variant="secondary"
        >
          보관
        </Button>
      </form>
    </div>
  );
}
