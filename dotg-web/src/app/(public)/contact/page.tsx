import type { Metadata } from "next";
import Link from "next/link";
import { ContactCard } from "@/components/shared/contact-card";
import { SocialBanner } from "@/components/shared/social-banner";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "연락처",
  description: "DotG의 문의 안내와 SNS 채널 정보를 확인합니다.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border bg-background py-16">
        <Container className="space-y-4">
          <p className="text-sm font-semibold text-primary">Contact</p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
            연락처
          </h1>
          <p className="max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
            현재 공식 연락 채널을 정리 중입니다. 지원 관련 안내는 모집
            페이지에서 확인해 주세요.
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold text-primary">문의 안내</p>
            <h2 className="text-2xl font-semibold tracking-normal">
              확인된 연락 수단만 안내합니다
            </h2>
            <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              실제 이메일, 전화번호, 외부 커뮤니티 링크가 확정되기 전까지는
              작동하는 연락 링크로 표시하지 않습니다.
            </p>
          </div>
          <ContactCard />
        </Container>
      </section>

      <SocialBanner />

      <section className="py-14">
        <Container>
          <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-semibold text-primary">지원 문의</p>
              <h2 className="text-2xl font-semibold tracking-normal">
                지원 관련 내용은 모집 안내에서 확인해 주세요
              </h2>
              <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                모집 일정, 지원 방법, 지원 링크는 모집 페이지에서 안내합니다.
                외부 링크는 실제 주소가 확정된 뒤 연결됩니다.
              </p>
            </div>
            <div className="mt-6">
              <Link className={buttonClasses()} href="/recruitment">
                모집 안내 보기
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
