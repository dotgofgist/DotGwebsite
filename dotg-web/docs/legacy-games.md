# 기존 게임 등록

`content/legacy-games.json`은 `temp`에서 확인한 MinePG v1.0과 StarFlight v1.0.0의 등록 원본입니다. 소개, 버전, 실행 방법, 원본 표지 경로와 전달받은 제작자 정보를 관리합니다.

2026-11-20 사용자에게 전달받은 인계 정보를 반영했습니다. 두 게임의 장르는 아케이드이며 제작 기간은 2023년 7월 ~ 12월입니다. MinePG는 성정훈, StarFlight는 김재형·채성빈이 제작했습니다. StarFlight의 소개 문구는 “지뢰를 피하며 앞으로 나아가라!”입니다. 제작 기간은 소개에 월 단위로 표기하며, 확인되지 않은 정확한 날짜나 출시일로 변환하지 않습니다.

2026-11-20 연결된 Supabase에 `minepg`, `starflight` 프로젝트와 표지를 공개 등록했습니다. 이후 사용자가 게시한 [GitHub Releases](https://github.com/dotgofgist/dotg-game-releases/releases)의 ZIP으로 두 프로젝트 다운로드 링크를 연결했습니다. GitHub 자산의 크기와 SHA-256이 준비된 패키지와 일치하고, 공개 다운로드 요청이 HTTP 200을 반환하며 파일 크기가 일치함을 확인했습니다. 기존 Supabase의 StarFlight ZIP은 보관 중입니다.

현재 다운로드 주소는 `content/legacy-games.json`의 `downloadUrl`로 관리합니다. Supabase에는 해당 URL을 `project_links`에 등록하며, 로컬 미리보기와 신규 프로젝트 등록도 같은 주소를 사용합니다.

- [MinePG v1.0 다운로드](https://github.com/dotgofgist/dotg-game-releases/releases/download/minepg-v1.0/MinePG-v1.0-windows-x64.zip)
- [StarFlight v1.0.0 다운로드](https://github.com/dotgofgist/dotg-game-releases/releases/download/starflight-v1.0.0/StarFlight-v1.0.0-windows-x64.zip)

## 확인한 파일

| 게임 | 구성 | 실행 파일 | 배포 ZIP 크기 |
| --- | --- | --- | --- |
| MinePG v1.0 | Python 3.11 / Pygame Windows 64비트 배포판, 이미지와 런타임 | `MinePG/Untitled.exe` | 260,679,640 bytes (248.6 MiB) |
| StarFlight v1.0.0 | Unity Windows 64비트 배포판, Mono 런타임과 게임 데이터 | `StarFlight/My project.exe` | 28,126,724 bytes (26.8 MiB) |

소스 코드가 아닌 실행용 빌드입니다. 실행 파일을 실행하지 않고 파일 구성, ZIP 무결성, 게임 이미지, 어셈블리의 문자열을 확인했습니다. MinePG의 스토리와 챌린지 메뉴는 동봉된 `image/main0.png`, `image/chal0.png`로 확인했습니다. 장르와 제작자·제작 기간, StarFlight의 게임 설명은 사용자가 전달한 인계 정보에 근거하며, 조작법은 추정해 작성하지 않았습니다.

## 패키지 재생성

저장소 루트의 `temp/MinePG v1.0`, `temp/StarFlight v1.0.0`을 그대로 둔 상태에서 `dotg-web`에서 실행합니다. Python 3.11 이상이 필요합니다.

```powershell
pnpm run games:prepare
```

pnpm 런처가 네트워크 연결을 요구하는 환경에서는 `python scripts/prepare-legacy-games.py`로 직접 실행할 수 있습니다.

- 결과: `artifacts/legacy-games/`의 ZIP 두 개와 SHA-256/크기를 담은 `manifest.json`.
- MinePG ZIP은 원본 그대로 복사하고 SHA-256을 대조합니다.
- StarFlight는 내려받기 과정에서 생긴 날짜 접미사 폴더를 벗겨, 실행 파일 옆에 `My project_Data`와 `MonoBleedingEdge`를 배치합니다. 게임 파일 내용은 바꾸지 않습니다.
- 표지는 `public/images/projects/`에 원본 PNG로 복사합니다.
- 원본 `temp/`와 생성 ZIP은 Git에서 제외합니다. 배포 ZIP은 파일 저장소에 별도로 업로드합니다.

## 사이트 데이터 등록

Supabase를 사용하지 않는 로컬 개발에서는 기존 샘플 프로젝트에 두 게임이 함께 표시됩니다. Supabase를 설정한 환경은 계속 DB만 조회하므로, 실제 사이트와 관리자 목록에 표시하려면 DB 등록이 필요합니다. 하드코딩된 콘텐츠로 관리자 공개/비공개 설정을 우회하지 않습니다.

먼저 쓰기 없이 등록 내용을 검사합니다.

```powershell
pnpm run games:import
```

검사 후 승인된 관리 작업에서만 `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 프로세스 환경에 제공하고 실행합니다. 키를 소스나 JSON에 저장하지 마세요.

```powershell
pnpm run games:import --apply
```

현재 신규 등록은 GitHub 다운로드 주소를 사용하므로 ZIP을 Supabase에 다시 업로드할 필요가 없습니다. 이전 업로드 방식인 `--upload-starflight`는 StarFlight의 `downloadUrl`과 별도 다운로드 URL을 지정하지 않았을 때만 사용할 수 있습니다.

등록 스크립트는 폼과 표지를 검증하고, 같은 slug가 있으면 기존 데이터를 유지합니다. 새 프로젝트를 임시저장으로 생성한 뒤 `{projectId}/thumbnail/{uuid}.png` 표지를 업로드하고 공개합니다. 실패 시 이번 실행이 만든 임시저장 레코드와 표지만 정리합니다. 기존 프로젝트, 버킷 설정, 권한 정책은 변경하지 않습니다.

다운로드 주소를 바꾸려면 `downloadUrl`을 수정하거나 다음 형태의 JSON을 `--downloads <파일>`로 전달해 신규 등록의 기본 주소를 덮어쓸 수 있습니다. 값은 실제 업로드를 마친 HTTPS 주소여야 하며 공개 전에 HEAD 요청으로 확인합니다. 등록 스크립트는 기존 프로젝트를 건드리지 않으므로 이미 등록했다면 관리자 프로젝트 편집 화면에서도 링크를 수정합니다.

```json
{
  "minepg": "https://your-download-host/MinePG-v1.0-windows-x64.zip",
  "starflight": "https://your-download-host/StarFlight-v1.0.0-windows-x64.zip"
}
```

자료실의 코드와 migration에는 100 MiB 제한이 있습니다. MinePG는 이를 초과하므로 두 게임의 프로젝트 다운로드에 GitHub Releases를 사용합니다. 유효한 다운로드 주소가 없는 게임에는 가짜 링크를 넣지 않으며, 상세 화면에 “다운로드 파일을 준비 중입니다” 안내를 표시합니다.
