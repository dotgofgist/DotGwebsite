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
                함께 만드는 게임 제작 동아리
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              <p>
                {siteConfig.name}는 게임을 기획하고 개발하며 제작 경험을
                공유하는 창작 동아리입니다. 하나의 게임은 기획, 프로그래밍,
                그래픽, UI, 사운드처럼 여러 영역이 맞물릴 때 완성됩니다.
              </p>
              <p>
                결과물만큼 과정도 중요하게 바라봅니다. 아이디어가 어떤
                시행착오를 거쳐 플레이 가능한 형태가 되는지 함께 기록하고
                나누는 방향을 지향합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
