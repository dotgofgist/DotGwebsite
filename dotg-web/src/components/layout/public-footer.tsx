import Link from "next/link";
import { Container } from "@/components/ui/container";
import { publicNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface text-foreground">
      <Container className="grid gap-8 py-10 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            게임을 기획하고 개발하며 경험을 공유하는 게임창작부입니다.
          </p>
          <p className="text-xs text-neutral-500">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <nav aria-label="바닥글 메뉴">
            <p className="mb-3 text-sm font-semibold">빠른 링크</p>
            <ul className="grid gap-2">
              {publicNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    className="inline-flex min-h-8 items-center rounded-md text-sm text-neutral-600 hover:text-foreground focus-visible:text-foreground dark:text-neutral-300"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-3 text-sm font-semibold">관리</p>
            <Link
              className="inline-flex min-h-8 items-center rounded-md text-sm text-neutral-600 hover:text-foreground focus-visible:text-foreground dark:text-neutral-300"
              href="/admin/login"
            >
              관리자 로그인
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
