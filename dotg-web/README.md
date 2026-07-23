# DotG 웹사이트

DotG 게임창작부 웹사이트입니다. 동아리 소개, 프로젝트 아카이브, 모집 안내, 공지사항, 연락처, 관리자 콘텐츠 관리 화면을 제공합니다.

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Database, Storage
- pnpm

## 로컬 실행

```powershell
pnpm install
pnpm dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 확인합니다.

## 주요 명령어

```powershell
pnpm lint
pnpm build
pnpm exec tsc --noEmit
pnpm supabase db reset
pnpm supabase test db
pnpm run supabase:types
```

## 환경 변수

`.env.example`을 참고해 `.env.local`을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`.env.local`은 Git에 커밋하지 않습니다.

## 현재 데이터 상태

공개 프로젝트, 공지사항, 모집 정보, 사이트 설정, 연락처, SNS 링크는 Supabase 조회로 연결되어 있습니다. Supabase 환경 변수가 없을 때는 일부 공개 페이지가 로컬 fallback 데이터를 사용합니다.

관리자 화면은 Supabase Auth의 `editor` 또는 `admin` 프로필 역할만 접근할 수 있으며, 프로젝트/공지사항/모집/사이트 설정/연락처/SNS 관리가 Supabase에 저장됩니다.

## Storage

이미지는 Supabase Storage public bucket을 사용합니다.

- `project-images`: 프로젝트 대표 이미지
- `site-assets`: 사이트 로고와 메인 Hero 이미지

DB에는 object path만 저장하고, 공개 URL은 조회 시 생성합니다. 업로드는 JPEG, PNG, WebP만 허용하며 서버에서 MIME과 파일 시그니처를 함께 검증합니다. 자세한 내용은 `docs/storage-management.md`를 참고하세요.

## 문서

- `docs/database-schema.md`
- `docs/authentication.md`
- `docs/recruitment-management.md`
- `docs/storage-management.md`
