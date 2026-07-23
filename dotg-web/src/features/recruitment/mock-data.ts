import type { Recruitment } from "./types";

export const recruitment: Recruitment = {
  id: "current-recruitment",
  title: "DotG 신규 부원 모집",
  summary:
    "게임 제작에 관심 있는 구성원과 함께 기획, 개발, 아트, 사운드 분야의 프로젝트를 진행합니다.",
  status: "upcoming",
  target: [
    "게임 제작에 관심 있는 사람",
    "팀 프로젝트에 꾸준히 참여할 수 있는 사람",
    "기획, 개발, 아트, 사운드 등 자신의 관심 분야를 탐색하고 싶은 사람",
  ],
  qualifications: [
    "게임 개발 경험은 필수가 아닙니다.",
    "서로의 역할과 작업을 존중할 수 있어야 합니다.",
    "프로젝트 진행 과정에서 소통과 피드백에 참여할 수 있어야 합니다.",
  ],
  activities: [
    "게임 아이디어 기획",
    "프로토타입 및 프로젝트 개발",
    "게임 테스트와 피드백",
    "게임잼, 발표, 회고 활동",
  ],
  schedule: {},
  process: [
    {
      title: "모집 공지 확인",
      description: "모집 기간과 지원 방법을 확인합니다.",
    },
    {
      title: "지원서 제출",
      description: "지원 링크가 공개되면 안내된 양식으로 제출합니다.",
    },
    {
      title: "지원 내용 확인",
      description: "필요한 경우 간단한 추가 안내가 진행될 수 있습니다.",
    },
    {
      title: "최종 안내",
      description: "활동 일정과 참여 방법을 전달합니다.",
    },
  ],
  applicationLabel: "지원 링크 준비 중",
  updatedAt: "2026-07-01",
};
