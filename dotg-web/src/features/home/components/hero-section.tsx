import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function HeroSection() {
  return (
    <section className="overflow-hidden border-b border-border bg-background py-16 sm:py-20">
      <Container className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary">
              {siteConfig.title}
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
              게임을 만들고,
              <br />
              경험을 함께 쌓습니다.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
              DotG는 기획, 프로그래밍, 아트, 사운드 등 다양한 분야의
              구성원이 함께 게임을 만드는 창작 동아리입니다.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className={buttonClasses({ size: "lg" })} href="/projects">
              프로젝트 보기
            </Link>
            <Link
              className={buttonClasses({ size: "lg", variant: "secondary" })}
              href="/recruitment"
            >
              모집 안내
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative min-h-72 rounded-lg border border-border bg-surface p-5"
        >
          <div className="grid h-full min-h-60 grid-cols-4 gap-3">
            <div className="rounded-md border border-border bg-background" />
            <div className="col-span-2 rounded-md border border-border bg-primary/15" />
            <div className="rounded-md border border-border bg-background" />
            <div className="col-span-2 rounded-md border border-border bg-background" />
            <div className="rounded-md border border-border bg-primary/25" />
            <div className="rounded-md border border-border bg-background" />
            <div className="rounded-md border border-border bg-primary/20" />
            <div className="col-span-3 rounded-md border border-border bg-background" />
          </div>
          <div className="absolute bottom-8 left-8 right-8 rounded-md border border-border bg-background p-4">
            <div className="mb-3 h-3 w-28 rounded-full bg-primary/60" />
            <div className="grid gap-2">
              <div className="h-2 rounded-full bg-foreground/20" />
              <div className="h-2 w-2/3 rounded-full bg-foreground/20" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
