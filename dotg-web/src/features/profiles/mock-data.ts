import type { MemberProfile } from "./types";

export const profileMocks: MemberProfile[] = [
  { id: "10000000-0000-4000-8000-000000000001", slug: "doyun", name: "도윤", position: "Developer", summary: "DotG 웹사이트와 서비스 경험을 설계하고 구현합니다.", details: "프로젝트의 구조를 다듬고, 사용자에게 자연스러운 웹 경험을 전달하는 작업을 맡고 있습니다.\n\n안정적인 코드와 명확한 인터페이스를 중요하게 생각합니다.", skills: ["Next.js", "TypeScript", "Supabase"], imageUrl: null, githubUrl: "https://github.com/", websiteUrl: null, isPublished: true, sortOrder: 0, updatedAt: "2026-08-20T00:00:00.000Z" },
  { id: "10000000-0000-4000-8000-000000000002", slug: "game-designer", name: "게임 디자이너", position: "Game Designer", summary: "플레이어가 기억할 규칙과 경험을 설계합니다.", details: "게임의 핵심 재미를 찾고 시스템과 레벨 디자인으로 구체화합니다.", skills: ["Game Design", "Level Design"], imageUrl: null, githubUrl: null, websiteUrl: null, isPublished: true, sortOrder: 1, updatedAt: "2026-08-20T00:00:00.000Z" },
  { id: "10000000-0000-4000-8000-000000000003", slug: "visual-artist", name: "비주얼 아티스트", position: "Visual Artist", summary: "DotG 프로젝트의 세계와 분위기를 시각 언어로 만듭니다.", details: "컨셉, 인터페이스, 그래픽 자산을 통해 프로젝트의 개성을 표현합니다.", skills: ["Illustration", "UI Design"], imageUrl: null, githubUrl: null, websiteUrl: null, isPublished: true, sortOrder: 2, updatedAt: "2026-08-20T00:00:00.000Z" },
];
