import { socialLinks } from "@/config/social";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

function hasConfiguredUrl(href: string): boolean {
  return href !== "#";
}

export function SocialBanner() {
  return (
    <section className="border-y border-border bg-surface py-14">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">SNS</p>
            <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              활동 소식이 모이는 곳
            </h2>
            <p className="max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              실제 SNS 주소가 확정되면 이 영역에서 프로젝트 기록과 동아리
              소식을 연결합니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {socialLinks.map((link) => {
              const configured = hasConfiguredUrl(link.href);
              const initials = link.name.slice(0, 2).toUpperCase();

              return (
                <Card key={link.name} className="bg-background">
                  <CardContent className="flex min-h-28 items-start gap-4 p-5">
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold"
                    >
                      {initials}
                    </span>
                    <div className="min-w-0 space-y-1">
                      {configured ? (
                        <a
                          className="inline-flex rounded-md text-sm font-semibold hover:text-primary focus-visible:text-primary"
                          href={link.href}
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          {link.label} 새 탭에서 열기
                        </a>
                      ) : (
                        <p
                          aria-disabled="true"
                          className="text-sm font-semibold text-foreground"
                        >
                          {link.label} 준비 중
                        </p>
                      )}
                      {link.description ? (
                        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                          {link.description}
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
