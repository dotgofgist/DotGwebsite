app: URL과 레이아웃만 담당

page.tsx가 복잡한 DB 처리나 폼 로직을 직접 갖지 않도록 합니다.

export default async function ProjectsPage() {
  return <ProjectGrid />;
}
features: 기능별 코드 담당

프로젝트 기능은 전부 features/projects 안에서 관리합니다.

목록 UI
상세 UI
관리자 폼
조회 함수
수정 함수
타입

공개 사이트와 관리자 사이트 모두 같은 기능 코드를 재사용할 수 있습니다.

components/ui: 특정 기능과 무관한 UI

다음처럼 사이트 어디서나 쓸 수 있는 것만 넣습니다.

Button
Card
Input
Container
Badge
Pagination

ProjectCard처럼 특정 기능에 종속된 컴포넌트는 features/projects/components에 넣습니다.

settings: 소개·연락처·SNS 관리

다음 콘텐츠는 모두 관리자 /admin/settings에서 관리하도록 묶습니다.

동아리 이름
동아리 소개
대표 이메일
연락처
디스코드 링크
인스타그램 링크
유튜브 링크
GitHub 링크
SNS 배너 문구