import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const activities = [
  {
    title: "게임잼",
    description: "가이드라인을 따라 나만의 게임 개발에 도전하며 첫걸음을 내딛습니다.",
  },
  {
    title: "팀 게임 개발",
    description: "자유롭게 팀을 구성해 학기 단위로 원하는 게임을 꾸준히 개발합니다.",
  },
  {
    title: "DotG 스터디",
    description: "선배, 동기와 함께 공부하며 게임 개발에 필요한 지식을 쌓습니다.",
  },
  {
    title: "친목 행사",
    description: "게임을 좋아하는 부원들이 다양한 주제로 함께 즐기며 가까워집니다.",
  },
  {
    title: "외부 행사 참가",
    description: "외부 게임잼과 대회에 참가해 더 넓은 무대에서 경험을 쌓습니다.",
  },
  {
    title: "성과 발표",
    description: "주간 및 학기말 발표에서 완성한 작품을 보여주고 서로의 성장을 확인합니다.",
  },
];

export function ActivitySection() {
  return (
    <section className="bg-surface py-16">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">주요 활동</p>
          <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            만들고, 배우고, 함께 성장합니다
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            게임을 직접 만드는 경험부터 스터디, 교류, 외부 도전과 결과물
            발표까지 다양한 활동을 함께합니다.
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
