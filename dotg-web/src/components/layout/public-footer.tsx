import Link from "next/link";
import { Container } from "@/components/ui/container";
import { publicNavigation } from "@/config/navigation";
import { getPublicSiteSettings } from "@/features/settings/public-queries";

export async function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const siteSettings = await getPublicSiteSettings();

  return (
    <footer className="border-t border-border bg-surface text-foreground">
      <Container className="grid gap-8 py-10 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <p className="text-lg font-semibold">{siteSettings.name}</p>
          <p className="max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            {siteSettings.shortDescription}
          </p>
          <p className="text-xs text-neutral-500">
            © {currentYear} {siteSettings.name}. All rights reserved.
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
