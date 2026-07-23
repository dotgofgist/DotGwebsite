import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { MobileMenu, PublicDesktopNavigation } from "./mobile-menu";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 text-foreground backdrop-blur">
      <Container className="relative flex min-h-16 items-center justify-between gap-3 py-3">
        <Link
          aria-label={`${siteConfig.name} 홈으로 이동`}
          className="inline-flex min-h-10 min-w-0 items-center rounded-md text-xl font-semibold tracking-normal"
          href="/"
        >
          {siteConfig.name}
        </Link>
        <PublicDesktopNavigation />
        <MobileMenu />
      </Container>
    </header>
  );
}
