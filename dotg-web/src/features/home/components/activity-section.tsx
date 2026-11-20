import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const activities = [
  {
    title: "대형 프로젝트",
    description: "학기 단위로 전 동아리원에 참여해 AA급 게임을 개발합니다.",
  },
  {
    title: "토이 프로젝트",
    description: "분기 단위로 소규모 팀을 구성해 짧은 기간동안 인디 게임을 개발합니다.",
  },
  {
    title: "게임잼",
    description: "학기당 한 번씩 개최되며, 다양한 주제로 게임 개발에 도전합니다.",
  },
  {
    title: "전국 행사 견학",
    description: "분기마다 PlayX4, Unite, GXG, Unreal dev day 등 다양한 외부 행사에 참여해 최신 트렌드를 학습합니다.",
  },
  {
    title: "연합 동아리 활동",
    description: "분기마다 전국의 게임창작부와 함께 연합 행사를 개최하여 타교에서 인맥을 쌓고, 다양한 활동을 함께합니다.",
  },
  {
    title: "주간 성과 보고",
    description: "주간 단위로 진행 상황을 공유하고, 서로의 성장을 돕습니다.",
  },
];

export function ActivitySection() {
  return (
    <section className="bg-surface py-16">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">주요 활동</p>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            우리와 함께 상상을 그려보자!
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            게임창작부는 다양한 활동을 통해 게임 개발에 대한 경험과 지식을 쌓을 수 있는 기회를 제공합니다.
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
