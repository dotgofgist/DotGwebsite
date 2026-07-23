import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import {
  getAdminSiteSettings,
  getAllAdminContactItems,
  getAllAdminSocialLinks,
} from "@/features/settings/admin-queries";
import { ContactItemList } from "@/features/settings/components/contact-item-list";
import { SiteHeroImageForm } from "@/features/settings/components/site-hero-image-form";
import { SiteLogoForm } from "@/features/settings/components/site-logo-form";
import { SiteSettingsForm } from "@/features/settings/components/site-settings-form";
import { SocialLinkList } from "@/features/settings/components/social-link-list";
import type { AdminSiteSettings } from "@/features/settings/types";

type AdminSettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "사이트 설정",
};

function fallbackAdminSiteSettings(): AdminSiteSettings {
  const timestamp = new Date(0).toISOString();

  return {
    id: 1,
    name: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    shortDescription: siteConfig.shortDescription,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function statusMessage(params: Record<string, string | string[] | undefined>) {
  if (params.saved === "settings") return "사이트 설정을 저장했습니다.";
  if (params.image === "logo") return "사이트 로고 이미지를 저장했습니다.";
  if (params.image === "hero") return "Hero 이미지를 저장했습니다.";
  if (params.image === "logo-removed") return "사이트 로고 이미지를 제거했습니다.";
  if (params.image === "hero-removed") return "Hero 이미지를 제거했습니다.";
  if (params.deleted === "contact") return "연락처를 삭제했습니다.";
  if (params.deleted === "social") return "SNS 링크를 삭제했습니다.";
  if (params.error) return "요청을 처리하지 못했습니다. 다시 시도해 주세요.";

  return null;
}

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const params = (await searchParams) ?? {};
  const [siteSettings, contactItems, socialLinks] = await Promise.all([
    getAdminSiteSettings(),
    getAllAdminContactItems(),
    getAllAdminSocialLinks(),
  ]);
  const settings = siteSettings ?? fallbackAdminSiteSettings();
  const message = statusMessage(params);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="사이트 설정"
        description="사이트 기본 정보, 로고, Hero 이미지, 연락처, SNS 링크를 관리합니다."
      />
      {message ? (
        <p className="rounded-md border border-border bg-surface p-3 text-sm leading-6">
          {message}
        </p>
      ) : null}
      {!siteSettings ? (
        <p className="rounded-md border border-border bg-surface p-3 text-sm leading-6 text-neutral-500">
          아직 DB 설정 row가 없습니다. 현재 config 값을 초기값으로 표시하며 저장하면 singleton row가 생성됩니다.
        </p>
      ) : null}
      <SiteSettingsForm initialSettings={settings} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SiteLogoForm settings={settings} />
        <SiteHeroImageForm settings={settings} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">연락처</h2>
            <p className="mt-1 text-sm text-neutral-500">
              비활성 연락처는 공개 페이지에 표시되지 않습니다.
            </p>
          </div>
          <Link className={buttonClasses()} href="/admin/settings/contacts/new">
            새 연락처
          </Link>
        </div>
        <ContactItemList contactItems={contactItems} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">SNS 링크</h2>
            <p className="mt-1 text-sm text-neutral-500">
              활성 상태이며 URL이 있는 SNS만 공개 페이지에 표시됩니다.
            </p>
          </div>
          <Link className={buttonClasses()} href="/admin/settings/social-links/new">
            새 SNS 링크
          </Link>
        </div>
        <SocialLinkList socialLinks={socialLinks} />
      </section>
    </div>
  );
}
