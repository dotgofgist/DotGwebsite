import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const goals = [
  "아이디어를 실제 플레이 가능한 결과물로 발전시키기",
  "서로 다른 분야의 구성원이 협업하는 경험 쌓기",
  "프로젝트 과정과 시행착오를 공유하기",
  "완성된 결과물을 발표하고 피드백 받기",
];

export function ClubGoals() {
  return (
    <section className="bg-surface py-14">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">활동 목표</p>
          <h2 className="text-2xl font-semibold tracking-normal">
            제작 경험을 쌓기 위한 목표
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal, index) => (
            <Card key={goal} className="bg-background">
              <CardHeader>
                <p className="text-sm font-semibold text-primary">
                  목표 {index + 1}
                </p>
                <CardTitle className="text-lg">{goal}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  각 목표는 프로젝트 규모와 팀 구성에 맞춰 유연하게 다룰 수
                  있습니다.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
