import type { Notice } from "./types";

export const notices: Notice[] = [
  {
    id: "website-operation-guide",
    slug: "website-operation-guide",
    title: "웹사이트 운영 안내",
    summary: "프로젝트 및 모집 정보를 순차적으로 업데이트합니다.",
    content:
      "DotG 웹사이트는 동아리 소개, 프로젝트 기록, 공지사항, 모집 안내를 정리하기 위한 공간으로 준비하고 있습니다.\n\n현재 공개된 정보는 임시 데이터와 기본 구조를 바탕으로 구성되어 있으며, 실제 운영 정보가 확정되면 순차적으로 교체할 예정입니다.\n\n확정되지 않은 일정이나 외부 링크는 실제 정보처럼 보이지 않도록 표시하지 않습니다.",
    pinned: true,
    publishedAt: "2026-07-01",
    updatedAt: "2026-07-08",
  },
  {
    id: "project-registration-guide",
    slug: "project-registration-guide",
    title: "프로젝트 등록 안내",
    summary: "완성된 프로젝트와 개발 중인 프로젝트를 정리할 예정입니다.",
    content:
      "프로젝트 페이지에는 동아리에서 다루는 게임 제작 활동을 소개할 수 있는 구조가 마련되어 있습니다.\n\n후속 단계에서 실제 프로젝트 데이터가 준비되면 목록과 상세 페이지에 연결됩니다.\n\n프로젝트 제목, 설명, 상태, 태그, 참여 역할, 외부 링크를 안전하게 관리하는 방향으로 확장할 예정입니다.",
    pinned: false,
    publishedAt: "2026-06-24",
  },
  {
    id: "recruitment-notice-guide",
    slug: "recruitment-notice-guide",
    title: "모집 공지 확인 방법",
    summary: "모집 일정과 지원 링크는 모집 안내 페이지에서 확인할 수 있습니다.",
    content:
      "모집 관련 정보는 모집 안내 페이지에서 확인할 수 있도록 구성하고 있습니다.\n\n현재 공식 모집 일정과 지원 링크는 아직 제공되지 않았으므로, 실제 지원 링크처럼 동작하는 임시 링크를 만들지 않습니다.\n\n모집 일정이 확정되면 공지사항과 모집 안내 페이지에 함께 반영할 수 있습니다.",
    pinned: false,
    publishedAt: "2026-06-17",
  },
  {
    id: "activity-record-update",
    slug: "activity-record-update",
    title: "활동 기록 업데이트 안내",
    summary: "게임잼과 발표 등 주요 활동 기록을 정리할 예정입니다.",
    content:
      "동아리 활동 기록은 프로젝트, 게임잼, 발표, 회고와 같은 흐름을 중심으로 정리할 예정입니다.\n\n실제 활동 날짜와 내용이 확인되기 전에는 구체적인 행사 일정이나 성과를 임의로 작성하지 않습니다.\n\n웹사이트 구조가 안정되면 활동 기록을 한곳에서 살펴볼 수 있도록 점진적으로 보강합니다.",
    pinned: false,
    publishedAt: "2026-06-10",
  },
];
