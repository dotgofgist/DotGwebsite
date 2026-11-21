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
                우리는 게임을 만듭니다
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              <p>
                {siteConfig.name}는 게임을 좋아하는 사람들이 자신이 원하는
                게임을 만드는 것에 참여할 수 있는 동아리입니다. 기획, 프로그래밍,
                디자인 등 분야와 경험에 관계없이 열정이 있는 누구나 
                자신만의 아이디어를 이 세상에 강림시킬 수 있도록 지원합니다.
              </p>
              <p>
                학기 중 게임잼과 팀 프로젝트를 통해 개발하고,
                전국 게임창작부 연합과 함께 공부할 수 있습니다. 외부 게임잼과
                대회에도 도전하며, 주간 성과 발표를 통해 완성한
                작품을 공유합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
