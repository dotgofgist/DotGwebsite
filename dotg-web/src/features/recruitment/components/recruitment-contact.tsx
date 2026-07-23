import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import type { Recruitment } from "../types";

type RecruitmentContactProps = {
  recruitment: Recruitment;
};

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function RecruitmentContact({ recruitment }: RecruitmentContactProps) {
  if (recruitment.contact) {
    const { contact } = recruitment;

    return (
      <section className="py-12">
        <Container>
          <Card>
            <CardContent className="space-y-3 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-normal">
                모집 문의
              </h2>
              <p className="text-sm text-neutral-500">{contact.label}</p>
              {contact.href ? (
                <a
                  className="inline-flex rounded-md text-sm font-semibold text-primary hover:text-foreground focus-visible:text-foreground"
                  href={contact.href}
                  rel={isExternalHref(contact.href) ? "noreferrer noopener" : undefined}
                  target={isExternalHref(contact.href) ? "_blank" : undefined}
                >
                  {contact.value}
                  {isExternalHref(contact.href) ? " 새 탭에서 열기" : ""}
                </a>
              ) : (
                <p className="text-sm font-semibold">{contact.value}</p>
              )}
            </CardContent>
          </Card>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12">
      <Container>
        <Card>
          <CardContent className="space-y-4 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-normal">
              더 확인할 곳
            </h2>
            <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              모집 문의 채널이 확정되기 전까지는 연락처와 공지사항 페이지에서
              최신 안내를 확인해 주세요.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className={buttonClasses({ variant: "secondary" })}
                href="/contact"
              >
                연락처 보기
              </Link>
              <Link
                className={buttonClasses({ variant: "secondary" })}
                href="/notices"
              >
                공지사항 보기
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
