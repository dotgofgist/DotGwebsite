import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { SocialLinkForm } from "@/features/settings/components/social-link-form";

export const metadata: Metadata = {
  title: "새 SNS 링크",
};

export default function NewSocialLinkPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="새 SNS 링크"
        description="활성 SNS 링크는 URL이 있어야 공개 페이지에 표시됩니다."
        action={
          <Link className={buttonClasses({ variant: "secondary" })} href="/admin/settings">
            설정으로
          </Link>
        }
      />
      <SocialLinkForm mode="create" />
    </div>
  );
}
