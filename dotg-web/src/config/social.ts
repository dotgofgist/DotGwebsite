export type SocialLink = {
  name: string;
  label: string;
  href: string;
  description?: string;
};

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    label: "GitHub",
    href: "#",
    description: "프로젝트 저장소와 개발 기록",
  },
  {
    name: "Instagram",
    label: "Instagram",
    href: "#",
    description: "활동 사진과 짧은 소식",
  },
  {
    name: "YouTube",
    label: "YouTube",
    href: "#",
    description: "발표 영상과 제작 기록",
  },
  {
    name: "Discord",
    label: "Discord",
    href: "#",
    description: "커뮤니티와 프로젝트 소통 공간",
  },
];
