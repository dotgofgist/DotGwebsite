import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { buttonClasses } from "@/components/ui/button";
import { getAdminRecruitmentById } from "@/features/recruitment/admin-queries";
import { RecruitmentForm } from "@/features/recruitment/components/recruitment-form";

type EditRecruitmentPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "모집 정보 수정",
};

export default async function EditRecruitmentPage({
  params,
}: EditRecruitmentPageProps) {
  const { id } = await params;
  const recruitment = await getAdminRecruitmentById(id);

  if (!recruitment) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="모집 정보 수정"
        description="모집 본문과 절차를 함께 저장합니다."
        action={
          <Link className={buttonClasses({ variant: "secondary" })} href="/admin/recruitment">
            목록으로
          </Link>
        }
      />
      <RecruitmentForm initialRecruitment={recruitment} mode="edit" />
    </div>
  );
}
