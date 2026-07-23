import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "project-aurora",
    slug: "project-aurora",
    title: "Project Aurora",
    summary: "픽셀 그래픽 기반의 탐험 게임 프로토타입입니다.",
    description:
      "Project Aurora는 작은 세계를 탐험하며 단서를 모으는 게임 콘셉트를 실험하는 샘플 프로젝트입니다. 이동, 상호작용, 맵 구성처럼 탐험 게임의 기본 감각을 확인하는 데 초점을 둡니다. 실제 공개 이력이나 배포 성과가 아닌 웹사이트 구성을 위한 임시 데이터입니다.",
    status: "developing",
    tags: ["2D", "픽셀", "탐험", "프로토타입"],
    featured: true,
    members: [
      { name: "기획 팀", role: "플레이 경험 설계" },
      { name: "개발 팀", role: "프로토타입 구현" },
      { name: "아트 팀", role: "픽셀 그래픽 방향" },
    ],
    links: [],
    startedAt: "2026-03-01",
    createdAt: "2026-02-20",
  },
  {
    id: "signal-lost",
    slug: "signal-lost",
    title: "Signal Lost",
    summary: "제한된 공간에서 단서를 찾는 퍼즐 게임 콘셉트입니다.",
    description:
      "Signal Lost는 좁은 공간 안에서 관찰과 추론을 통해 다음 행동을 찾는 퍼즐 게임 콘셉트입니다. 분위기, 단서 배치, 상호작용 규칙을 중심으로 아이디어를 정리하는 단계입니다. 아직 실제 출시나 외부 링크가 연결된 프로젝트는 아닙니다.",
    status: "planning",
    tags: ["퍼즐", "기획", "미스터리"],
    featured: true,
    members: [
      { name: "기획 팀", role: "퍼즐 구조 설계" },
      { name: "사운드 팀", role: "분위기 구성" },
    ],
    links: [],
    createdAt: "2026-04-05",
  },
  {
    id: "project-forge",
    slug: "project-forge",
    title: "Project Forge",
    summary: "여러 개발 실험을 기록하는 팀 프로젝트입니다.",
    description:
      "Project Forge는 입력, UI, 전투, 저장 구조처럼 게임 개발에서 반복적으로 필요한 기능을 작은 실험으로 나누어 확인하는 샘플 프로젝트입니다. 완성된 상업 게임을 의미하지 않으며, 제작 과정과 학습 기록을 정리하기 위한 형태입니다. 웹사이트에서는 공개된 샘플 프로젝트 상태를 보여주는 예시로 사용합니다.",
    status: "released",
    tags: ["Unity", "UI", "개발 실험", "팀 프로젝트"],
    featured: false,
    members: [
      { name: "개발 팀", role: "기능 실험" },
      { name: "기획 팀", role: "테스트 시나리오" },
      { name: "아트 팀", role: "UI 스타일 점검" },
      { name: "사운드 팀", role: "효과음 테스트" },
    ],
    links: [],
    startedAt: "2026-01-15",
    releasedAt: "2026-05-20",
    createdAt: "2026-01-10",
  },
];
