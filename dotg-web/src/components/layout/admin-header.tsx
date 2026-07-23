import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminMobileMenu } from "./admin-mobile-menu";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="relative flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <AdminMobileMenu />
          <div className="min-w-0">
            <p className="text-sm font-semibold">관리자 페이지</p>
            <p className="text-xs text-neutral-500">관리자</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-neutral-400 hover:bg-surface hover:text-foreground focus-visible:bg-surface sm:inline-flex"
            href="/"
          >
            공개 사이트 보기
          </Link>
          <Button disabled size="sm" variant="secondary">
            로그아웃 준비 중
          </Button>
        </div>
      </div>
    </header>
  );
}
