import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";
import { getSafeAdminReturnPath } from "@/features/auth/redirects";
import { getCurrentContentManager } from "@/features/auth/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "관리자 로그인",
  description: "DotG 관리자 페이지 로그인",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLoginPageProps = {
  searchParams: Promise<{
    next?: string;
    reason?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { next, reason } = await searchParams;
  const nextPath = getSafeAdminReturnPath(next);
  const configured = isSupabaseConfigured();
  let managerFound = false;

  if (configured) {
    try {
      const manager = await getCurrentContentManager();

      if (manager) {
        managerFound = true;
      }
    } catch {
      // The form explains configuration/profile setup issues without leaking internals.
    }
  }

  if (managerFound) {
    redirect(nextPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-semibold text-primary">DotG Admin</p>
          <CardTitle>관리자 로그인</CardTitle>
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            editor 또는 admin 역할이 있는 계정만 관리자 페이지에 접근할 수
            있습니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {reason === "not-configured" ? (
            <p className="rounded-md border border-border bg-surface p-3 text-sm text-neutral-600 dark:text-neutral-300">
              Supabase 인증 환경이 설정되지 않았습니다.
            </p>
          ) : null}
          <AdminLoginForm disabled={!configured} nextPath={nextPath} />
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
