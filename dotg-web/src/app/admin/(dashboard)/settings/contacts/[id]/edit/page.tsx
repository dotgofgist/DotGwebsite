import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { getAdminContactItemById } from "@/features/settings/admin-queries";
import { ContactItemDeleteForm } from "@/features/settings/components/contact-item-delete-form";
import { ContactItemForm } from "@/features/settings/components/contact-item-form";

type EditContactItemPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "연락처 수정",
};

export default async function EditContactItemPage({
  params,
}: EditContactItemPageProps) {
  const { id } = await params;
  const contactItem = await getAdminContactItemById(id);

  if (!contactItem) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="연락처 수정"
        description="공개 노출 여부와 정렬 순서를 함께 관리합니다."
        action={
          <Link className={buttonClasses({ variant: "secondary" })} href="/admin/settings">
            설정으로
          </Link>
        }
      />
      <ContactItemForm initialContactItem={contactItem} mode="edit" />
      <ContactItemDeleteForm id={contactItem.id} label={contactItem.label} />
    </div>
  );
}
