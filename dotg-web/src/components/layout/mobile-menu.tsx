"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { publicNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import { isNavigationItemActive } from "./navigation-utils";

const mobileNavigationId = "mobile-navigation";

export function PublicDesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {publicNavigation.map((item) => {
          const active = isNavigationItemActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-surface hover:text-foreground focus-visible:bg-surface dark:text-neutral-300",
                  active &&
                    "bg-surface text-foreground shadow-[inset_0_0_0_1px_var(--border)]",
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
  );
}

export function MobileMenu() {
  const pathname = usePathname();

  return <MobileMenuContent key={pathname} pathname={pathname} />;
}

function MobileMenuContent({ pathname }: { pathname: string }) {
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
        aria-controls={mobileNavigationId}
        aria-expanded={open}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-surface"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? (
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        )}
      </button>

      {open ? (
        <nav
          aria-label="모바일 주요 메뉴"
          className="absolute inset-x-0 top-full border-b border-border bg-background px-4 py-3 shadow-sm"
          id={mobileNavigationId}
        >
          <ul className="mx-auto grid max-w-6xl gap-1">
            {publicNavigation.map((item) => {
              const active = isNavigationItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-surface hover:text-foreground focus-visible:bg-surface dark:text-neutral-300",
                      active &&
                        "bg-surface text-foreground shadow-[inset_0_0_0_1px_var(--border)]",
                    )}
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
