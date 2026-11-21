# TSB v0.1 프로젝트 등록

2026-11-21 사용자 요청으로 현재 구현을 v0.1로 공개하고 운영 중인 Supabase에 새 프로젝트를 등록했습니다. 웹사이트 코드 배포 없이 기존 프로젝트 조회·이미지 저장·다운로드 링크 기능을 사용했습니다.

- 공개 페이지: https://www.dotgsince2023.co.kr/projects/trickcal-shooting-balddagu
- GitHub 릴리즈: https://github.com/pinata0/Fyrox-TSB/releases/tag/v0.1
- 다운로드: https://github.com/pinata0/Fyrox-TSB/releases/download/v0.1/TSB.exe?build=9dcd2536f2a3
- 프로젝트 ID: `dcdd6b6d-9545-44fb-81ac-d866fe6ee32a`
- 상태: 개발 중 / 공개 게시
- 개발 시작: `2026-11-12`
- 첫 공개일: `2026-11-21`
- 게시일: `2026-11-21T00:00:00+09:00` (날짜만 지정되어 한국 시간 자정으로 저장)
- 대표 이미지: `public/images/projects/tsb-v0.1.png` (1672×941, 2,667,472바이트)
- Storage 객체: `project-images/dcdd6b6d-9545-44fb-81ac-d866fe6ee32a/thumbnail/fb0a56dd-ccc1-4788-8341-d3593b5ea10d.png`

등록 원본은 `content/tsb-v0.1.json`, 재현 가능한 등록 절차는 `scripts/import-tsb.mts`에 있습니다. 제작자 이름은 제공되지 않아 임의로 추가하지 않았습니다. 기존 프로젝트는 수정하지 않았습니다.

## 검증

- 웹사이트의 프로젝트 폼·이미지 규칙으로 본문과 PNG를 검사했습니다.
- GitHub 공개 URL을 HEAD 요청으로 검사한 뒤 등록했습니다.
- EXE는 339,184,445바이트이며 GitHub 자산 SHA-256이 로컬과 일치합니다: `3def454e881b7607b99235079cd40a520ae628c61464582acdf46891dcc0ac83`.
- 공개 페이지에서 제목, 대표 이미지, v0.1 다운로드 링크, 개발 시작일과 게시일을 확인했습니다.
- 게임은 개발 중인 사전 공개 버전입니다. 자동 테스트 495개 통과 / 3개 실패와 종합 GPU 스모크 테스트의 최종 판정 실패를 릴리즈 노트에 공개했습니다.

## 등록 스크립트

`node --experimental-strip-types scripts/import-tsb.mts`는 로컬 자료만 검사합니다. `--apply`는 운영 DB·Storage에 실제로 게시하며, 동일 slug가 있으면 중단합니다. 등록을 다시 실행해 기존 프로젝트를 덮어쓰지 마세요.

관리 키는 환경변수 또는 기존 Supabase CLI 로그인에서 메모리로만 불러옵니다. 키를 파일·로그에 기록하지 않습니다. 다른 계정으로 작업한다면 해당 운영 프로젝트의 관리 권한이 필요합니다.

## 마요 팔 핫픽스 / 2026-11-21

버전과 버튼 표기는 v0.1로 유지하고 GitHub의 `TSB.exe`를 교체했습니다. 새 파일은 339,195,143바이트이며 SHA-256은 `9dcd2536f2a37f4349331a446c47a87985cf15d2d2cc7c9150e5e0847ffc5cc7`입니다. 다운로드 링크에 `?build=9dcd2536f2a3`를 붙여 현재 빌드를 구분합니다. 기존 기본 URL에서도 같은 핫픽스를 제공합니다.

`scripts/update-tsb-hotfix.mts`는 기본 실행 시 기존 프로젝트·다운로드 링크만 조회합니다. `--apply`는 공개 GitHub 자산의 SHA-256·크기와 실제 다운로드 응답을 확인한 뒤, 기존 프로젝트의 다운로드 URL 한 필드만 조건부로 갱신합니다. 제목·버전·게시일·대표 이미지는 유지합니다.
