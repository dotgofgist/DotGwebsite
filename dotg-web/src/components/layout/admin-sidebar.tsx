"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import { isAdminNavigationItemActive } from "./admin-navigation-utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
      <div className="flex h-full flex-col p-5">
        <div className="space-y-1">
          <Link className="inline-flex rounded-md text-xl font-semibold" href="/admin">
            DotG Admin
          </Link>
          <p className="text-xs leading-5 text-neutral-400">콘텐츠 관리 영역</p>
        </div>

        <nav aria-label="관리자 메뉴" className="mt-8 flex-1">
          <ul className="grid gap-1">
            {adminNavigation.map((item) => {
              const active = isAdminNavigationItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-neutral-400 hover:bg-background hover:text-foreground focus-visible:bg-background",
                      active && "bg-background text-foreground shadow-[inset_0_0_0_1px_var(--border)]",
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-neutral-400 hover:bg-background hover:text-foreground focus-visible:bg-background"
          href="/"
        >
          공개 사이트 보기
        </Link>
      </div>
    </aside>
  );
}
