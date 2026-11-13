# 플레이어 라운지

`/play`는 일반 사용자 로그인·가입·비밀번호 재설정, 게임 프로필, 친구 관계, 방 초대를 제공합니다. 관리자 로그인은 `/admin/login`을 그대로 사용합니다. 공개 동아리원 소개 카드(`member_profiles`)와 플레이어 프로필(`game_profiles`)은 서로 다릅니다.

## 배포 전에

1. 새 마이그레이션 `supabase/migrations/20261113090000_add_game_social.sql`을 검토합니다. 기존 데이터 삭제나 관리자 권한 확대는 하지 않습니다.
2. 연결할 Supabase 프로젝트를 확인하고 `pnpm exec supabase db push --dry-run`으로 적용 대상을 확인한 뒤 `pnpm exec supabase db push`로 적용합니다. 이 구현 작업에서는 운영 DB에 적용하지 않았습니다.
3. Supabase Auth의 Site URL을 실제 웹사이트 원본 주소로, Redirect URLs에 `https://실제-도메인/auth/callback**`를 설정합니다. 개발에서는 `http://localhost:3000/auth/callback**`도 허용합니다. Preview 도메인은 필요한 주소만 별도로 추가합니다.
4. 일반 이메일 가입을 허용하고 이메일 인증 및 운영용 SMTP 설정을 확인합니다. 기본 Supabase 메일 서비스의 제한에 의존해 일반 사용자에게 출시하지 않습니다.
5. 기본 PKCE 메일 링크는 `/auth/callback?code=...`로 돌아옵니다. 다른 브라우저에서도 링크를 열어야 하면 Supabase 메일 템플릿을 `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup` 형태로 변경할 수 있습니다. 비밀번호 복구 템플릿은 `type=recovery`를 사용합니다.
6. 기존 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`와 사이트 URL 설정으로 Next.js를 배포합니다. 새 service-role 키나 서버 서명 환경 변수는 필요하지 않습니다.

## 데이터와 권한

- `game_profiles`: Auth UUID, 고유 사용자 ID, 닉네임, 소개, 색상.
- `game_friendships`: 두 사용자 사이 하나의 요청/친구 관계. 받은 사람만 수락합니다.
- `game_blocks`: 차단한 사람만 차단 해제 가능. 차단은 양방향 친구 관계와 방 초대를 삭제합니다.
- `game_sessions`: 호스트, 직접 접속 주소, 2시간 만료, 초대 마감 상태.
- `game_invites`: 친구에 대한 15분짜리 초대. 수락 후에만 참가 파일을 발급합니다.
- `game_private.session_keys`: 호스트 서명 키. 일반 테이블 API나 상대방에게 공개하지 않습니다.

모든 테이블은 RLS를 활성화하고 일반 역할의 직접 테이블 권한을 제거합니다. `game_social(action, payload)`는 `auth.uid()`를 기준으로 각 행동을 검증하며, 로그인한 사용자만 실행 가능합니다. 작은 동아리 서비스의 변경 작업은 advisory lock 하나로 직렬화하여 상호 요청·차단·수락 경쟁 조건을 방지합니다. 규모가 커지면 사용자 쌍/방별 잠금으로 조정합니다.

웹 API는 `/api/game/social`입니다. GET은 현재 사용자 대시보드, POST는 검증된 행동을 처리합니다. 모든 응답은 private/no-store이고 쿠키 기반 POST는 같은 원본에서만 허용합니다. 방 주소와 호스트 비밀은 공개 페이지에 표시하지 않습니다.

## 게임 실행

프로필 작성 → 친구 요청/수락 → 호스트 방 생성 → 호스트 파일로 게임 실행 → 친구 초대 → 상대 수락 → 참가 파일로 게임 실행 순서입니다. 게임 폴더의 `scripts/Start-OnlineGame.ps1 -SessionFile <파일>`을 사용합니다.

현재는 직접 UDP 테스트입니다. 접속 가능한 네트워크 경로가 필요하며 자동 포트 통과/중계는 구현되지 않았습니다. EOS 준비 후 전송 계층을 연동해야 합니다. UI에도 이 제한을 표시합니다.

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
