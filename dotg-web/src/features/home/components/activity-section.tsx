import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const activities = [
  {
    title: "게임 기획",
    description: "게임의 규칙, 플레이 경험, 레벨 구조를 설계합니다.",
  },
  {
    title: "프로그래밍",
    description: "프로토타입과 실제 플레이 가능한 기능을 구현합니다.",
  },
  {
    title: "그래픽 및 아트",
    description: "캐릭터, 배경, UI처럼 화면에 보이는 요소를 다룹니다.",
  },
  {
    title: "사운드",
    description: "효과음과 음악으로 게임의 분위기와 피드백을 설계합니다.",
  },
  {
    title: "팀 프로젝트",
    description: "역할을 나누고 협업하며 하나의 결과물을 만들어 갑니다.",
  },
  {
    title: "게임잼 및 발표",
    description: "짧은 제작 실험과 발표를 통해 피드백을 나눌 수 있습니다.",
  },
];

export function ActivitySection() {
  return (
    <section className="bg-surface py-16">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">주요 활동</p>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            게임 제작에 필요한 여러 영역을 다룹니다
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            관심 분야에 따라 기획, 개발, 아트, 사운드, 발표와 피드백까지
            다양한 제작 과정을 경험할 수 있습니다.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => (
            <Card key={activity.title} className="bg-background">
              <CardHeader>
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                >
                  {index + 1}
                </span>
                <CardTitle className="text-lg">{activity.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {activity.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
