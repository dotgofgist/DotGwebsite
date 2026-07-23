import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";

export const metadata: Metadata = {
  title: "관리자 로그인",
  description: "DotG 관리자 페이지 로그인",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-semibold text-primary">DotG Admin</p>
          <CardTitle>관리자 로그인</CardTitle>
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            Supabase Auth 연결 전까지 로그인 요청은 전송되지 않습니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <AdminLoginForm />
          <Link
            className="inline-flex rounded-md text-sm font-medium text-neutral-600 hover:text-foreground focus-visible:text-foreground dark:text-neutral-300"
            href="/"
          >
            공개 사이트로 돌아가기
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
