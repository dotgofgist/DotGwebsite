# Download Function

* History folder: 업데이트(도윤)
* Started: 2026-08-23
* Status: In Progress

## Purpose

DotG 웹사이트에 파일 업로드 및 다운로드가 가능한 자료실 기능을 추가한다.

일반 사용자는 공개된 자료실에서 업로드된 파일 목록을 확인하고 다운로드할 수 있으며, 관리자 권한을 가진 사용자는 관리자 페이지를 통해 파일을 업로드하고 삭제할 수 있도록 구성한다.

파일 저장은 프로젝트에서 기존에 사용하고 있는 Supabase Storage 구조를 활용한다.

## Current Baseline

현재 프로젝트는 Next.js, React, TypeScript와 Supabase를 기반으로 구성되어 있다.

기존 프로젝트에서는 Supabase Authentication, Database, Storage를 사용하고 있으며 이미지 저장을 위한 Storage 구조와 `can_manage_content()` 기반의 콘텐츠 관리 권한이 존재한다.

이번 작업을 시작하기 전에는 일반 파일을 관리하기 위한 별도의 자료실 페이지와 Storage bucket이 존재하지 않았다.

또한 로컬 개발 환경에는 기존 프로젝트에서 사용하던 Supabase 환경변수가 제공되지 않아 현재 Supabase Backend와 직접 연결할 수 없는 상태이다.

## Goals

1. 일반 사용자가 파일 목록을 확인할 수 있는 자료실 페이지를 추가한다.
2. 일반 사용자가 등록된 파일을 다운로드할 수 있도록 한다.
3. 관리자 페이지에서 새로운 파일을 업로드할 수 있도록 한다.
4. 관리자가 업로드된 파일을 삭제할 수 있도록 한다.
5. 기존 프로젝트의 Supabase Storage 및 권한 구조를 최대한 재사용한다.
6. 기존 웹사이트 구조와 디자인에 영향을 최소화하면서 기능을 추가한다.

## Implemented Scope

### Public Download Page

다음 공개 페이지를 추가하였다.

`/downloads`

일반 사용자는 해당 페이지에서 Supabase Storage의 `downloads` bucket에 저장된 파일 목록을 조회할 수 있도록 구성하였다.

파일 목록에서는 Storage metadata를 이용하여 파일명, 파일 크기, 업로드 시각 등의 정보를 표시할 수 있도록 구현하였다.

등록된 파일은 다운로드 기능을 통해 사용자의 로컬 환경으로 받을 수 있도록 구성하였다.

### Admin Download Management

다음 관리자 페이지를 추가하였다.

`/admin/downloads`

관리자는 해당 페이지에서 파일을 선택하여 Supabase Storage에 업로드할 수 있도록 구성하였다.

업로드된 파일 목록을 관리자 페이지에서도 확인할 수 있으며 기존 파일을 다운로드하거나 삭제할 수 있도록 구현하였다.

파일 업로드 최대 크기는 현재 100MB로 설정하였다.

### Supabase Storage

자료실 전용 Storage bucket을 생성하기 위한 migration을 추가하였다.

추가된 migration:

`supabase/migrations/20260823000100_add_download_storage.sql`

해당 migration은 `downloads` Storage bucket과 파일 접근에 필요한 정책을 생성하도록 구성하였다.

일반 사용자는 파일을 읽을 수 있고 파일의 추가 및 삭제와 같은 관리 작업은 기존 프로젝트의 콘텐츠 관리 권한 체계를 사용하도록 구성하였다.

### Navigation

공개 사이트 navigation에 자료실 메뉴를 추가하였다.

`자료실 → /downloads`

관리자 navigation에는 자료실 관리 메뉴를 추가하였다.

`자료실 관리 → /admin/downloads`

기존 `src/config/navigation.ts` 구조를 유지하면서 새로운 navigation entry만 추가하였다.

## Changed Files

이번 작업에서 다음 파일이 추가 또는 수정되었다.

### Added

`src/app/(public)/downloads/page.tsx`

공개 자료실 페이지 및 파일 다운로드 기능을 담당한다.

`src/app/admin/downloads/page.tsx`

관리자용 파일 업로드, 다운로드 및 삭제 기능을 담당한다.

`supabase/migrations/20260823000100_add_download_storage.sql`

Supabase Storage의 `downloads` bucket 및 관련 정책을 생성한다.

### Modified

`src/config/navigation.ts`

공개 자료실과 관리자 자료실 관리 페이지로 이동할 수 있는 navigation 항목을 추가하였다.

## Local Development

GitHub repository를 로컬 환경에 clone하고 Node.js 및 pnpm 개발 환경을 구성하였다.

프로젝트 dependency 설치 후 다음 명령으로 Next.js 개발 서버가 실행되는 것을 확인하였다.

```bash
pnpm install
pnpm dev
```

Next.js 16.2.11 개발 서버가 정상적으로 실행되는 것까지 확인하였다.

공개 자료실은 다음 경로를 사용한다.

`http://localhost:3000/downloads`

관리자 자료실은 다음 경로를 사용한다.

`http://localhost:3000/admin/downloads`

## Current Issue

현재 기존 프로젝트에서 사용하던 Supabase 프로젝트의 환경변수를 전달받지 못한 상태이다.

필요한 환경변수는 다음과 같다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

현재 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 존재하지 않기 때문에 `/downloads` 접근 시 Supabase client 생성 과정에서 Runtime Error가 발생한다.

따라서 Next.js 페이지 및 route 자체의 추가는 완료되었지만 실제 Supabase Storage와 연결한 파일 업로드/다운로드 동작은 아직 검증하지 못하였다.

## Remaining Work

현재 완료하지 못한 작업은 다음과 같다.

1. 기존 Supabase 프로젝트 접근 권한 확보 또는 새로운 Supabase 프로젝트 생성
2. `NEXT_PUBLIC_SUPABASE_URL` 설정
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
4. 기존 프로젝트의 Supabase migration 적용
5. 새로 추가한 `20260823000100_add_download_storage.sql` migration 적용
6. `downloads` Storage bucket 생성 여부 확인
7. 관리자 인증 및 `can_manage_content()` 권한 동작 확인
8. 관리자 페이지에서 실제 파일 업로드 테스트
9. 공개 `/downloads` 페이지에서 업로드된 파일 목록 조회 테스트
10. 실제 파일 다운로드 테스트
11. 관리자 페이지에서 파일 삭제 테스트
12. 파일명 중복 및 특수문자 처리 테스트
13. 100MB 파일 크기 제한 동작 확인
14. 업로드/삭제 실패 시 사용자 오류 메시지 확인
15. 최종 lint, type check 및 build 테스트

## Completion Criteria

다음 조건을 만족하면 자료실 기능 구현을 완료한 것으로 판단한다.

* `/downloads` 페이지가 정상적으로 표시된다.
* Supabase Storage의 파일 목록이 정상적으로 조회된다.
* 일반 사용자가 파일을 다운로드할 수 있다.
* 일반 사용자는 파일을 업로드하거나 삭제할 수 없다.
* 관리자 권한 사용자는 `/admin/downloads`에서 파일을 업로드할 수 있다.
* 관리자 권한 사용자는 업로드된 파일을 삭제할 수 있다.
* 파일 크기 제한이 정상적으로 적용된다.
* 기존 관리자 인증 및 콘텐츠 관리 권한에 영향을 주지 않는다.
* Supabase Storage 정책이 의도한 권한대로 동작한다.
* production build가 정상적으로 완료된다.

## Development Log

### 2026-08-23

* 기존 DotGwebsite repository를 로컬 환경에 clone하였다.
* VS Code, Git, Node.js 및 pnpm을 이용한 개발 환경을 구성하였다.
* 기존 프로젝트의 Next.js 및 Supabase 구조를 확인하였다.
* 별도의 Database table을 추가하지 않고 Supabase Storage bucket 자체를 파일 목록으로 활용하는 방향으로 자료실 구조를 설계하였다.
* 일반 사용자를 위한 `/downloads` 페이지를 추가하였다.
* 관리자를 위한 `/admin/downloads` 페이지를 추가하였다.
* 파일 업로드, 다운로드 및 삭제를 위한 기본 코드를 구현하였다.
* `downloads` Storage bucket 및 관련 정책을 생성하기 위한 Supabase migration을 추가하였다.
* 공개 navigation에 `자료실` 항목을 추가하였다.
* 관리자 navigation에 `자료실 관리` 항목을 추가하였다.
* Next.js 개발 서버가 로컬 환경에서 실행되는 것을 확인하였다.
* 기존 Supabase 프로젝트의 환경변수가 repository에 포함되어 있지 않은 것을 확인하였다.
* Supabase 환경변수 부재로 인해 실제 Storage 연결 및 파일 업로드/다운로드 테스트는 진행하지 못하였다.

## Next Increment

* 기존 Supabase 프로젝트 접근 권한을 확보하거나 새로운 Supabase 프로젝트를 생성한다.
* 프로젝트의 `.env.local`에 Supabase URL과 anon key를 설정한다.
* 기존 및 신규 migration을 Supabase 프로젝트에 적용한다.
* 실제 파일을 이용하여 업로드, 목록 조회, 다운로드 및 삭제 기능을 검증한다.
* 관리자 권한과 일반 사용자 권한이 올바르게 분리되는지 확인한다.
* 오류 처리와 사용자 피드백 UI를 점검한다.
* lint, type check 및 production build를 수행하여 최종 구현 상태를 검증한다.
