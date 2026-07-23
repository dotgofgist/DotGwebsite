"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adminNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import { isAdminNavigationItemActive } from "./admin-navigation-utils";

const adminMobileNavigationId = "admin-mobile-navigation";

export function AdminMobileMenu() {
  const pathname = usePathname();

  return <AdminMobileMenuContent key={pathname} pathname={pathname} />;
}

function AdminMobileMenuContent({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        aria-controls={adminMobileNavigationId}
        aria-expanded={open}
        aria-label={open ? "관리자 메뉴 닫기" : "관리자 메뉴 열기"}
        className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="text-lg">
          {open ? "×" : "☰"}
        </span>
      </button>

      {open ? (
        <nav
          aria-label="모바일 관리자 메뉴"
          className="absolute inset-x-0 top-full border-b border-border bg-surface p-4 shadow-sm"
          id={adminMobileNavigationId}
        >
          <ul className="grid gap-1">
            {adminNavigation.map((item) => {
              const active = isAdminNavigationItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-neutral-400 hover:bg-background hover:text-foreground focus-visible:bg-background",
                      active && "bg-background text-foreground",
                    )}
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-neutral-400 hover:bg-background hover:text-foreground focus-visible:bg-background"
                href="/"
                onClick={() => setOpen(false)}
              >
                공개 사이트 보기
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
