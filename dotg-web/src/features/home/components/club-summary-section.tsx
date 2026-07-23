import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

const values = [
  "함께 만드는 프로젝트",
  "분야를 넘나드는 협업",
  "완성까지 이어가는 경험",
];

export function ClubSummarySection() {
  return (
    <section className="py-16">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-primary">동아리 소개</p>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            아이디어가 플레이 가능한 경험이 되는 곳
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            {siteConfig.shortDescription}. 작은 실험부터 팀 프로젝트까지,
            서로의 작업 과정을 공유하며 게임 제작을 배워갑니다.
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
            <Card key={value}>
              <CardHeader>
                <span className="text-sm font-semibold text-primary">
                  0{index + 1}
                </span>
                <CardTitle className="text-lg">{value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  각자의 관심 분야를 바탕으로 제작 과정에 참여할 수 있는
                  환경을 지향합니다.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
