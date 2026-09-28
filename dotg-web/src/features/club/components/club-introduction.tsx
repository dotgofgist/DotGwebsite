import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function ClubIntroduction() {
  return (
    <section className="py-14">
      <Container>
        <Card>
          <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary">DotG 소개</p>
              <h2 className="text-2xl font-semibold tracking-normal">
                자유롭게 팀을 이뤄 게임을 만드는 동아리
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              <p>
                {siteConfig.name}는 게임을 좋아하는 사람들이 자유롭게 팀을
                이루어 함께 게임을 만드는 동아리입니다. 기획, 프로그래밍,
                디자인 등 분야와 경험에 관계없이 열정이 있는 누구나 서로
                배우며 자신만의 아이디어를 실제 게임으로 발전시킬 수 있습니다.
              </p>
              <p>
                학기 중 게임잼과 팀 프로젝트를 중심으로 꾸준히 개발하고,
                스터디와 친목 활동으로 지식과 경험을 나눕니다. 외부 게임잼과
                대회에도 도전하며, 주간 및 학기말 성과 발표를 통해 완성한
                작품을 공유하고 서로의 성장을 확인합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
