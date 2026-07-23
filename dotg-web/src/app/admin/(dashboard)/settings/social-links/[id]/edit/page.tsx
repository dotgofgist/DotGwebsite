import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { getAdminSocialLinkById } from "@/features/settings/admin-queries";
import { SocialLinkDeleteForm } from "@/features/settings/components/social-link-delete-form";
import { SocialLinkForm } from "@/features/settings/components/social-link-form";

type EditSocialLinkPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "SNS 링크 수정",
};

export default async function EditSocialLinkPage({
  params,
}: EditSocialLinkPageProps) {
  const { id } = await params;
  const socialLink = await getAdminSocialLinkById(id);

  if (!socialLink) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="SNS 링크 수정"
        description="공개 노출 여부와 정렬 순서를 함께 관리합니다."
        action={
          <Link className={buttonClasses({ variant: "secondary" })} href="/admin/settings">
            설정으로
          </Link>
        }
      />
      <SocialLinkForm initialSocialLink={socialLink} mode="edit" />
      <SocialLinkDeleteForm id={socialLink.id} label={socialLink.label} />
    </div>
  );
}
