dotg-web/
├─ public/
│  ├─ images/
│  │  ├─ brand/                    # 로고, 심볼, 파비콘 원본
│  │  ├─ projects/                 # 개발 단계의 임시 프로젝트 이미지
│  │  └─ content/                  # 동아리 소개, 배너 이미지
│  └─ icons/                       # SNS 및 공통 아이콘
│
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                # 최상위 HTML, 폰트, 전역 메타데이터
│  │  ├─ globals.css               # Tailwind 및 전역 스타일
│  │  ├─ not-found.tsx             # 공통 404 페이지
│  │  │
│  │  ├─ (public)/                 # 공개 사이트 Route Group
│  │  │  ├─ layout.tsx             # Header + Footer 적용
│  │  │  ├─ page.tsx               # /
│  │  │  │
│  │  │  ├─ about/
│  │  │  │  └─ page.tsx            # /about
│  │  │  │
│  │  │  ├─ projects/
│  │  │  │  ├─ page.tsx            # /projects
│  │  │  │  └─ [slug]/
│  │  │  │     ├─ page.tsx         # /projects/{slug}
│  │  │  │     └─ not-found.tsx
│  │  │  │
│  │  │  ├─ recruitment/
│  │  │  │  └─ page.tsx            # /recruitment
│  │  │  │
│  │  │  ├─ notices/
│  │  │  │  ├─ page.tsx            # /notices
│  │  │  │  └─ [slug]/
│  │  │  │     ├─ page.tsx         # /notices/{slug}
│  │  │  │     └─ not-found.tsx
│  │  │  │
│  │  │  └─ contact/
│  │  │     └─ page.tsx            # /contact
│  │  │
│  │  └─ admin/
│  │     ├─ login/
│  │     │  └─ page.tsx             # /admin/login
│  │     │
│  │     └─ (dashboard)/            # 로그인 후 관리자 Route Group
│  │        ├─ layout.tsx            # 관리자 Header + Sidebar
│  │        ├─ page.tsx              # /admin
│  │        │
│  │        ├─ projects/
│  │        │  ├─ page.tsx           # /admin/projects
│  │        │  ├─ new/
│  │        │  │  └─ page.tsx        # /admin/projects/new
│  │        │  └─ [id]/
│  │        │     └─ edit/
│  │        │        └─ page.tsx     # /admin/projects/{id}/edit
│  │        │
│  │        ├─ notices/
│  │        │  ├─ page.tsx           # /admin/notices
│  │        │  ├─ new/
│  │        │  │  └─ page.tsx        # /admin/notices/new
│  │        │  └─ [id]/
│  │        │     └─ edit/
│  │        │        └─ page.tsx     # /admin/notices/{id}/edit
│  │        │
│  │        ├─ recruitment/
│  │        │  └─ page.tsx           # /admin/recruitment
│  │        │
│  │        └─ settings/
│  │           └─ page.tsx           # /admin/settings
│  │
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ public-header.tsx
│  │  │  ├─ public-footer.tsx
│  │  │  ├─ mobile-menu.tsx
│  │  │  ├─ admin-header.tsx
│  │  │  └─ admin-sidebar.tsx
│  │  │
│  │  ├─ ui/
│  │  │  ├─ button.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ container.tsx
│  │  │  ├─ section-heading.tsx
│  │  │  ├─ badge.tsx
│  │  │  ├─ input.tsx
│  │  │  ├─ textarea.tsx
│  │  │  ├─ select.tsx
│  │  │  └─ pagination.tsx
│  │  │
│  │  └─ shared/
│  │     ├─ social-banner.tsx
│  │     ├─ empty-state.tsx
│  │     ├─ loading-state.tsx
│  │     └─ confirm-dialog.tsx
│  │
│  ├─ features/
│  │  ├─ home/
│  │  │  └─ components/
│  │  │     ├─ hero-section.tsx
│  │  │     ├─ club-summary-section.tsx
│  │  │     ├─ featured-projects-section.tsx
│  │  │     ├─ latest-notices-section.tsx
│  │  │     └─ recruitment-cta-section.tsx
│  │  │
│  │  ├─ club/
│  │  │  ├─ components/
│  │  │  │  ├─ club-introduction.tsx
│  │  │  │  ├─ activity-list.tsx
│  │  │  │  └─ club-history.tsx
│  │  │  ├─ queries.ts
│  │  │  ├─ actions.ts
│  │  │  └─ types.ts
│  │  │
│  │  ├─ projects/
│  │  │  ├─ components/
│  │  │  │  ├─ project-card.tsx
│  │  │  │  ├─ project-grid.tsx
│  │  │  │  ├─ project-detail.tsx
│  │  │  │  ├─ project-form.tsx
│  │  │  │  └─ project-table.tsx
│  │  │  ├─ mock-data.ts
│  │  │  ├─ queries.ts
│  │  │  ├─ actions.ts
│  │  │  └─ types.ts
│  │  │
│  │  ├─ notices/
│  │  │  ├─ components/
│  │  │  │  ├─ notice-list.tsx
│  │  │  │  ├─ notice-item.tsx
│  │  │  │  ├─ notice-detail.tsx
│  │  │  │  ├─ notice-form.tsx
│  │  │  │  └─ notice-table.tsx
│  │  │  ├─ mock-data.ts
│  │  │  ├─ queries.ts
│  │  │  ├─ actions.ts
│  │  │  └─ types.ts
│  │  │
│  │  ├─ recruitment/
│  │  │  ├─ components/
│  │  │  │  ├─ recruitment-status.tsx
│  │  │  │  ├─ recruitment-guide.tsx
│  │  │  │  ├─ application-button.tsx
│  │  │  │  └─ recruitment-form.tsx
│  │  │  ├─ mock-data.ts
│  │  │  ├─ queries.ts
│  │  │  ├─ actions.ts
│  │  │  └─ types.ts
│  │  │
│  │  ├─ settings/
│  │  │  ├─ components/
│  │  │  │  ├─ site-settings-form.tsx
│  │  │  │  ├─ contact-settings-form.tsx
│  │  │  │  └─ social-links-form.tsx
│  │  │  ├─ mock-data.ts
│  │  │  ├─ queries.ts
│  │  │  ├─ actions.ts
│  │  │  └─ types.ts
│  │  │
│  │  └─ auth/
│  │     ├─ components/
│  │     │  └─ admin-login-form.tsx
│  │     ├─ actions.ts
│  │     ├─ guards.ts
│  │     └─ types.ts
│  │
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts              # Client Component용
│  │  │  ├─ server.ts              # Server Component/Action용
│  │  │  ├─ proxy.ts               # 인증 쿠키 갱신 함수
│  │  │  └─ database.types.ts      # Supabase 생성 타입
│  │  │
│  │  └─ utils/
│  │     ├─ cn.ts
│  │     ├─ date.ts
│  │     ├─ slug.ts
│  │     └─ file.ts
│  │
│  ├─ config/
│  │  ├─ navigation.ts             # 공개 및 관리자 메뉴
│  │  ├─ site.ts                   # 사이트 이름, 설명
│  │  └─ social.ts                 # SNS 기본 설정
│  │
│  └─ proxy.ts                     # Next.js 요청 Proxy
│
├─ supabase/
│  ├─ migrations/                  # DB 마이그레이션
│  ├─ seed.sql                     # 개발용 초기 데이터
│  └─ config.toml                  # 로컬 Supabase 사용 시
│
├─ .env.example
├─ .env.local
├─ eslint.config.mjs
├─ next.config.ts
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ postcss.config.mjs
├─ tsconfig.json
└─ README.md