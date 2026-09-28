import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getPublicSiteSettings } from "@/features/settings/public-queries";

const values = [
  {
    title: "자유로운 팀 구성",
    description: "관심사가 맞는 부원들과 팀을 이루어 원하는 게임을 개발합니다.",
  },
  {
    title: "함께 배우는 성장",
    description: "선배와 동료가 스터디와 제작 경험을 나누며 함께 발전합니다.",
  },
  {
    title: "도전과 공유",
    description: "게임잼과 대회에 도전하고 완성한 작품으로 서로의 성장을 확인합니다.",
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
            열정과 아이디어가 게임이 되는 곳
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
