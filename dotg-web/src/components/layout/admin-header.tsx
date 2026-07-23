import Link from "next/link";
import { LogoutForm } from "@/features/auth/components/logout-form";
import type { ContentManagerIdentity } from "@/features/auth/types";
import { AdminMobileMenu } from "./admin-mobile-menu";

type AdminHeaderProps = {
  managerPromise: Promise<ContentManagerIdentity>;
};

export async function AdminHeader({ managerPromise }: AdminHeaderProps) {
  const manager = await managerPromise;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="relative flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <AdminMobileMenu />
          <div className="min-w-0">
            <p className="text-sm font-semibold">관리자 페이지</p>
            <p className="truncate text-xs text-neutral-500">
              {manager.displayName ?? manager.email ?? manager.id}
              {" · "}
              {manager.role}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-neutral-400 hover:bg-surface hover:text-foreground focus-visible:bg-surface sm:inline-flex"
            href="/"
          >
            공개 사이트 보기
          </Link>
          <LogoutForm />
        </div>
      </div>
    </header>
  );
}
