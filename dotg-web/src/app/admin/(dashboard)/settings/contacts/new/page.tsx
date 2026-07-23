import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { ContactItemForm } from "@/features/settings/components/contact-item-form";

export const metadata: Metadata = {
  title: "새 연락처",
};

export default function NewContactItemPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="새 연락처"
        description="공개 연락처 페이지에 표시할 연락 수단을 추가합니다."
        action={
          <Link className={buttonClasses({ variant: "secondary" })} href="/admin/settings">
            설정으로
          </Link>
        }
      />
      <ContactItemForm mode="create" />
    </div>
  );
}
