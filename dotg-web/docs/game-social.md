# 플레이어 라운지

## 계정 · 프로필 · 친구 (2026-11-14)

사이트 상단의 계정 메뉴에서 `/signup`(회원가입), `/login`(로그인), `/account`(프로필 설정), `/friends`(친구 관리)를 엽니다. 비로그인 사용자의 설정·친구 접근은 로그인으로 이동하며 로그인 후 원래 화면으로 돌아옵니다. 기존 `/play`에도 같은 프로필·친구 기능을 유지합니다. 공개 동아리원 소개인 `/profiles`는 별도 기능입니다.

- 회원가입은 이름, 닉네임, 고유 사용자 ID, 이메일, 비밀번호·확인을 받습니다. Supabase Auth 가입 트리거가 플레이어 프로필을 생성하며 이메일 인증이 켜져 있으면 메일 확인 후 로그인합니다.
- `game_profiles.real_name`은 본인의 대시보드에만 반환합니다. 친구 검색·요청·목록·방·게임 참가권은 `display_name`(닉네임)을 사용하며 이름과 이메일은 노출하지 않습니다. 기존 계정의 이름은 빈 값으로 두고 본인이 설정하도록 합니다.
- 사진은 `/api/game/avatar`에서 JPG·PNG·WebP, 2MB, 1,600만 화소 이내의 정지 이미지만 받습니다. 서버에서 실제 이미지를 디코딩해 최대 512×512 WebP로 변환하며 메타데이터를 제거합니다. 선택 미리보기, 저장, 기본 사진 복원을 지원합니다.
- 사진 저장소는 공개 `player-avatars` 버킷이며 경로는 `사용자 UUID/새 UUID.webp`입니다. 사진 URL은 공개이므로 민감한 사진을 위한 비공개 저장소는 아닙니다. 업로드·파일 조회·삭제는 소유자만 가능하고, 현재 사용 중인 사진의 삭제와 파일 덮어쓰기를 막습니다. 새 사진 연결 후 이전 파일을 정리합니다.
- 사용자 ID·닉네임 검색(2~32자, 최대 20명), 친구 요청·수락·거절·취소·삭제, 차단 해제를 제공합니다. 요청은 받은 사람만 수락할 수 있습니다. 차단 관계는 양쪽 검색에서 제외합니다. 대기 요청과 친구는 20초마다, 창에 돌아왔을 때 새로 읽습니다.

새 마이그레이션 `supabase/migrations/20261114090000_add_player_account_settings.sql`을 기존 마이그레이션 다음에 적용한 뒤 웹 앱을 배포해야 합니다. 이 파일에는 열·가입 트리거·사진 버킷과 RLS 정책·RPC 갱신이 포함됩니다. 기존 계정·친구 관계·게임 연결은 유지하며 추가 서비스 키는 필요하지 않습니다. 실제 배포는 이 저장소의 기존 Supabase/Vercel 절차를 사용합니다.

이번 작업의 검증: 계정·게임·사진·권한 관련 Node/PGlite 테스트 36개, TypeScript 검사, Next.js 프로덕션 빌드 통과. 브라우저에서 가입·로그인 화면과 보호 경로의 로그인 이동을 확인했습니다. `tests/e2e/auth/player-accounts.spec.ts`에는 두 계정의 로그인·로그아웃, 사진 변경, 친구 요청·수락·삭제 시나리오를 추가했습니다. 로컬 Docker/Supabase가 실행되지 않아 이 통합 E2E와 실제 SMTP 인증 메일 전송은 실행하지 않았으며, 운영 DB 마이그레이션·웹 배포도 이 작업에서 수행하지 않았습니다.

인증·스토리지 API의 근거는 [Supabase 가입 API](https://supabase.com/docs/reference/javascript/auth-signup)와 [Storage 소유권 문서](https://supabase.com/docs/guides/storage/security/ownership)를 참고합니다.

## 실시간 방 목록

`/play`의 방 목록은 게임의 방 선택 화면과 같은 `/api/game/rooms`를 사용한다. 방 이름·방장·맵·인원·상태·8자리 방 코드를 15초마다 갱신한다. 공개 목록에는 호스트 접속 주소나 참가권·기기 토큰을 포함하지 않는다. 로그인하면 코드 참여 또는 목록의 참여 버튼으로 참가 파일을 받고, 실행 중인 게임에서는 같은 코드를 입력해 바로 참여한다.

게임의 **웹 계정 연결**은 10분짜리 연결 코드를 표시한다. 로그인한 사용자가 자기 게임에 표시된 코드임을 확인하고 **연결 승인**을 누르면 12시간 동안 방 작업만 가능한 기기 권한이 생긴다. 웹 계정 비밀번호나 Supabase 토큰을 게임에 넘기지 않는다. 호스트의 맵·상태·실제 인원은 15초마다 갱신하며, 나가기/정상 종료 시 닫고 60초간 갱신이 없으면 목록과 코드 참여에서 제외한다.

배포 시 `20261113110000_add_game_room_directory.sql`과 `20261113120000_add_eos_p2p_rooms.sql`을 순서대로 적용하고 Next.js 변경을 함께 배포해야 한다. 이 작업의 DB 검증은 격리된 PGlite에서 실행하며 운영 DB에는 적용하지 않는다. `tests/game-rooms.test.mts`는 연결 권한·방 소유권·공개 필드·서명·인원·차단·만료·EOS 주소를 검사한다.

`/play`는 일반 사용자 로그인·가입·비밀번호 재설정, 게임 프로필, 친구 관계, 방 초대를 제공합니다. 관리자 로그인은 `/admin/login`을 그대로 사용합니다. 공개 동아리원 소개 카드(`member_profiles`)와 플레이어 프로필(`game_profiles`)은 서로 다릅니다.

## 배포 전에

1. 새 마이그레이션 `supabase/migrations/20261113090000_add_game_social.sql`을 검토합니다. 기존 데이터 삭제나 관리자 권한 확대는 하지 않습니다.
2. 연결할 Supabase 프로젝트를 확인하고 `pnpm exec supabase db push --dry-run`으로 적용 대상을 확인한 뒤 `pnpm exec supabase db push`로 적용합니다. 이 구현 작업에서는 운영 DB에 적용하지 않았습니다.
3. Supabase Auth의 Site URL을 실제 웹사이트 원본 주소로, Redirect URLs에 `https://실제-도메인/auth/callback**`를 설정합니다. 개발에서는 `http://localhost:3000/auth/callback**`도 허용합니다. Preview 도메인은 필요한 주소만 별도로 추가합니다.
4. 일반 이메일 가입을 허용하고 이메일 인증 및 운영용 SMTP 설정을 확인합니다. 기본 Supabase 메일 서비스의 제한에 의존해 일반 사용자에게 출시하지 않습니다.
5. 기본 PKCE 메일 링크는 `/auth/callback?code=...`로 돌아옵니다. 다른 브라우저에서도 링크를 열어야 하면 Supabase 메일 템플릿을 `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup` 형태로 변경할 수 있습니다. 비밀번호 복구 템플릿은 `type=recovery`를 사용합니다.
6. 기존 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`와 사이트 URL 설정으로 Next.js를 배포합니다. 새 service-role 키나 서버 서명 환경 변수는 필요하지 않습니다.

## 데이터와 권한

- `game_profiles`: Auth UUID, 고유 사용자 ID, 이름(본인만 조회), 닉네임, 소개, 색상, 사진 경로.
- `game_friendships`: 두 사용자 사이 하나의 요청/친구 관계. 받은 사람만 수락합니다.
- `game_blocks`: 차단한 사람만 차단 해제 가능. 차단은 양방향 친구 관계와 방 초대를 삭제합니다.
- `game_sessions`: 호스트, 전송 유형(`direct_udp`/`eos_p2p`), 접속 주소 또는 EOS 방 코드, 2시간 만료, 초대 마감 상태.
- `game_invites`: 친구에 대한 15분짜리 초대. 수락 후에만 참가 파일을 발급합니다.
- `game_private.session_keys`: 호스트 서명 키. 일반 테이블 API나 상대방에게 공개하지 않습니다.

모든 테이블은 RLS를 활성화하고 일반 역할의 직접 테이블 권한을 제거합니다. `game_social(action, payload)`는 `auth.uid()`를 기준으로 각 행동을 검증하며, 로그인한 사용자만 실행 가능합니다. 작은 동아리 서비스의 변경 작업은 advisory lock 하나로 직렬화하여 상호 요청·차단·수락 경쟁 조건을 방지합니다. 규모가 커지면 사용자 쌍/방별 잠금으로 조정합니다.

웹 API는 `/api/game/social`입니다. GET은 현재 사용자 대시보드, POST는 검증된 행동을 처리합니다. 모든 응답은 private/no-store이고 쿠키 기반 POST는 같은 원본에서만 허용합니다. 방 주소와 호스트 비밀은 공개 페이지에 표시하지 않습니다.

## 게임 실행

프로필 작성 → 친구 요청/수락 → 호스트 방 생성 → 호스트 파일로 게임 실행 → 친구 초대 → 상대 수락 → 참가 파일로 게임 실행 순서입니다. 게임 폴더의 `scripts/Start-OnlineGame.ps1 -SessionFile <파일>`을 사용합니다.

게임 기본 방은 EOS P2P로 직접 연결을 시도하고 실패하면 Epic 중계를 사용합니다. 웹에는 `20261113110000_add_game_room_directory.sql`과 `20261113120000_add_eos_p2p_rooms.sql`, API 변경을 함께 적용해야 합니다. 게임에서 웹 계정을 연결한 후 방 이름만 입력하면 EOS 주소가 자동 등록되고, 참가자는 목록이나 8자리 코드로 들어갑니다. 실제 두 네트워크 접속 검증은 게임의 `tsb-eos-peer-check --host/--join --force-relay`를 사용합니다.

참가권은 5분 유효하며 호스트가 서명·방·계정·재사용을 확인합니다. 초대 마감/차단 후 새 참가권 발급은 막히지만, 이미 발급된 참가권은 남은 5분 이내에 사용될 수 있습니다. 이미 접속한 참가자도 강제로 끊지 않습니다. 호스트 파일과 참가 파일을 다른 사람에게 공유하지 않고 사용 후 삭제합니다.

## 테스트

```powershell
pnpm test:game-social
pnpm test:auth
pnpm test:supabase
pnpm supabase:migrations:check
pnpm exec tsc --noEmit
pnpm build
```

`test:game-social`은 PGlite에서 새 PostgreSQL DB를 만들고 pgcrypto와 실제 마이그레이션을 적용합니다. 운영 계정·DB·이메일을 사용하지 않습니다. Auth API 자체와 SMTP 전송, 운영 Redirect URL, 서로 다른 인터넷망의 게임 접속은 배포 설정 이후 별도 확인합니다.

## EOS 초대 파일 호환

기존 파일 다운로드 방식에서는 `tsb.exe --eos-host`의 F6 코드로 웹 방을 만들고, 기존 게임을 종료한 뒤 호스트 파일로 다시 실행합니다. 호스트는 자기 EOS ID와 파일의 호스트 ID가 일치해야 합니다. 참가 파일은 같은 `eos_p2p` 주소와 기존 HMAC 참가권을 담습니다. EOS ID를 웹 계정의 영구 식별자로 신뢰하지 않으며, 입장 계정은 서명된 참가권으로 검증합니다. 일반 코드 방은 서명된 웹 참가 요청을 거절하므로 다른 EOS 방 주소를 등록해도 웹 계정 인증을 우회할 수 없습니다.
