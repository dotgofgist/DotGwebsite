import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getPublicSiteSettings } from "@/features/settings/public-queries";

const values = [
  {
    title: "위대한 게임을",
    description: "그리자! 학기 프로젝트로 초거대 공룡만한 합작을!",
  },
  {
    title: "아름다운 게임을",
    description: "탐험하자! 분기마다 파티를 모아 전국의 컨퍼런스를 찾아서!",
  },
  {
    title: "자랑스런 게임을",
    description: "도전해보자! 전국의 겜창부와 만나 BIC, PlayX4, UNICODE에 나가보자!",
  },
];

export async function ClubSummarySection() {
  const siteSettings = await getPublicSiteSettings();

  return (
    <section className="py-16">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-primary">동아리 소개</p>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            상상해오던 너의 게임을 우리와 함께
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            {siteSettings.shortDescription}
          </p>
          <Link
            className={buttonClasses({ variant: "secondary" })}
            href="/about"
          >
            동아리 소개 보기
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {values.map((value, index) => (
            <Card key={value.title}>
              <CardHeader>
                <span className="text-sm font-semibold text-primary">
                  0{index + 1}
                </span>
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
