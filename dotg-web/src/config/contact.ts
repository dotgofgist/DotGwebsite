export type ContactItem = {
  label: string;
  value: string;
  href?: string;
  description?: string;
};

export const contactItems: ContactItem[] = [
  {
    label: "일반 문의",
    value: "공식 연락처 준비 중",
    description: "문의 채널이 확정되면 이곳에 안내됩니다.",
  },
  {
    label: "지원 문의",
    value: "모집 페이지에서 안내",
    description: "지원 일정과 방법은 모집 안내 페이지에 정리됩니다.",
  },
];
