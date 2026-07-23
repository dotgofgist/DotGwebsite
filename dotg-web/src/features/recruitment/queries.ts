import { recruitment } from "./mock-data";
import type { Recruitment } from "./types";

// TODO: Supabase 스키마 및 Repository 구현 후 mock data를 실제 조회로 교체
export function getCurrentRecruitment(): Recruitment {
  return recruitment;
}

export function isRecruitmentOpen(
  recruitmentInfo: Recruitment,
  now: Date = new Date(),
): boolean {
  if (
    recruitmentInfo.status !== "open" &&
    recruitmentInfo.status !== "always"
  ) {
    return false;
  }

  if (recruitmentInfo.status === "always") {
    return true;
  }

  if (recruitmentInfo.schedule.endsAt) {
    const endsAt = new Date(recruitmentInfo.schedule.endsAt);

    if (!Number.isNaN(endsAt.getTime()) && endsAt < now) {
      return false;
    }
  }

  return true;
}
