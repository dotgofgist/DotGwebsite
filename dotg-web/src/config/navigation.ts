export type NavigationItem = {
  label: string;
  href: string;
};

export const publicNavigation: readonly NavigationItem[] = [
  { label: "홈", href: "/" },
  { label: "동아리 소개", href: "/about" },
  { label: "프로젝트", href: "/projects" },
  { label: "모집 안내", href: "/recruitment" },
  { label: "공지사항", href: "/notices" },
  { label: "연락처", href: "/contact" },
] as const;

export const adminNavigation: readonly NavigationItem[] = [
  { label: "대시보드", href: "/admin" },
  { label: "프로젝트 관리", href: "/admin/projects" },
  { label: "공지사항 관리", href: "/admin/notices" },
  { label: "모집 관리", href: "/admin/recruitment" },
  { label: "사이트 설정", href: "/admin/settings" },
] as const;
