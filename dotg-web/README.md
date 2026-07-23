# DotG 웹사이트

DotG 게임창작부 웹사이트 프로젝트입니다. 동아리 소개, 프로젝트 아카이브, 모집 안내, 공지사항, 연락처와 관리자 콘텐츠 관리 화면을 단계적으로 구현합니다.

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- pnpm
- Supabase 예정
- Vercel 배포 예정

## 로컬 실행

```powershell
pnpm install
pnpm dev
```

개발 서버 실행 후 `http://localhost:3000`에서 확인합니다.

## 주요 명령어

```powershell
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## 현재 구현 단계

현재 단계는 프로젝트 구조와 공통 기반 구성입니다. 공개 사이트와 관리자 사이트의 App Router 경로를 준비했고, 각 경로에는 빌드 가능한 최소 임시 페이지가 들어 있습니다.

## 예정된 주요 기능

- 공개 Header와 Footer
- 모바일 메뉴
- 동아리 소개 콘텐츠
- 프로젝트 목록과 상세
- 공지사항 목록과 상세
- 모집 안내와 지원 링크
- 관리자 Header와 Sidebar
- 관리자 인증
- Supabase 연동
- 실제 콘텐츠 CRUD

## 환경 변수

`.env.example`을 참고해 로컬 환경에서 `.env.local`을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

아직 Supabase 클라이언트와 실제 인증 로직은 구현하지 않았습니다.
