import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminPlaceholderNotice } from "@/components/shared/admin-placeholder-notice";
import { ContactSettingsForm } from "@/features/settings/components/contact-settings-form";
import { SiteSettingsForm } from "@/features/settings/components/site-settings-form";
import { SocialLinksForm } from "@/features/settings/components/social-links-form";

export const metadata: Metadata = {
  title: "사이트 설정",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="사이트 설정"
        description="사이트 기본 정보, 연락처, SNS 링크 설정 UI입니다."
      />
      <AdminPlaceholderNotice />
      <SiteSettingsForm />
      <ContactSettingsForm />
      <SocialLinksForm />
    </div>
  );
}
