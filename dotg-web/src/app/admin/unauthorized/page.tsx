import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutForm } from "@/features/auth/components/logout-form";

export const metadata: Metadata = {
  title: "관리자 접근 권한 없음",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <p className="text-sm font-semibold text-primary">DotG Admin</p>
          <CardTitle>관리자 접근 권한이 없습니다</CardTitle>
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            이 계정에는 관리자 페이지 접근 권한이 없습니다. 관리자 프로필
            설정을 확인해 주세요.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link className={buttonClasses({ variant: "secondary" })} href="/">
            공개 사이트로 이동
          </Link>
          <LogoutForm />
        </CardContent>
      </Card>
    </main>
  );
}
