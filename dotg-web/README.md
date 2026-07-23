# DotG 웹사이트

DotG 게임창작부 웹사이트 프로젝트입니다. 동아리 소개, 프로젝트 아카이브, 모집 안내, 공지사항, 연락처와 관리자 콘텐츠 관리 화면을 단계적으로 구현합니다.

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- pnpm
- Supabase
- Vercel

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

현재 단계는 공개 사이트와 관리자 UI의 P0 골격을 mock data 기반으로 구성한 상태입니다. 프로젝트, 공지사항, 모집 안내, 관리자 콘텐츠 관리 화면이 로컬 데이터로 렌더링됩니다.

## 예정된 주요 기능

- Supabase Auth 기반 관리자 인증
- Supabase 테이블 기반 콘텐츠 조회
- 실제 콘텐츠 CRUD
- Supabase Storage 이미지 업로드
- Vercel 배포

## 환경 변수

`.env.example`을 참고해 프로젝트 루트에 `.env.local`을 만들고 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

설정 후 개발 서버를 다시 시작합니다. `.env.local`은 Git에 커밋하지 않습니다.

## 현재 데이터 상태

현재 프로젝트, 공지사항, 모집 콘텐츠는 로컬 mock data를 사용합니다. Supabase 클라이언트 구조는 준비되어 있지만 실제 테이블 조회와 저장은 아직 연결되지 않았습니다.

## Supabase 타입

`src/lib/supabase/database.types.ts`는 현재 placeholder 타입입니다. 실제 Supabase 프로젝트와 스키마가 준비되면 Supabase CLI로 생성한 타입으로 교체합니다.
