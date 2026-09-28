import type { Metadata } from "next";
import { getCanonicalUrl } from "@/config/site-url";
import { Container } from "@/components/ui/container";
import { ActivityList } from "@/features/club/components/activity-list";
import { ClubGoals } from "@/features/club/components/club-goals";
import { ClubHistory } from "@/features/club/components/club-history";
import { ClubIntroduction } from "@/features/club/components/club-introduction";
import { ClubProcess } from "@/features/club/components/club-process";

export const metadata: Metadata = {
  alternates: {
    canonical: getCanonicalUrl("/about"),
  },
  title: "동아리 소개",
  description: "게임창작부 DotG의 활동 목표와 제작 흐름을 소개합니다.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border bg-background py-16">
        <Container className="space-y-4">
          <p className="text-sm font-semibold text-primary">About DotG</p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
            동아리 소개
          </h1>
          <p className="max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
            DotG는 기획, 프로그래밍, 디자인 등 다양한 분야의 구성원이
            자유롭게 팀을 이루어 함께 배우고 게임을 만드는 동아리입니다.
          </p>
        </Container>
      </section>
      <ClubIntroduction />
      <ClubGoals />
      <ActivityList />
      <ClubProcess />
      <ClubHistory />
    </>
  );
}
