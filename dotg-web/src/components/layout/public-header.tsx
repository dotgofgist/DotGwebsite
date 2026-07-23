import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getPublicSiteSettings } from "@/features/settings/public-queries";
import { MobileMenu, PublicDesktopNavigation } from "./mobile-menu";

export async function PublicHeader() {
  const siteSettings = await getPublicSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 text-foreground backdrop-blur">
      <Container className="relative flex min-h-16 items-center justify-between gap-3 py-3">
        <Link
          aria-label={`${siteSettings.name} 홈으로 이동`}
          className="inline-flex min-h-10 min-w-0 items-center rounded-md text-xl font-semibold tracking-normal"
          href="/"
        >
          {siteSettings.name}
        </Link>
        <PublicDesktopNavigation />
        <MobileMenu />
      </Container>
    </header>
  );
}
