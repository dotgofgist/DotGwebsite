import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const goals = [
  "어떤 기술도 구현할 수 있는 사고의 가호를",
  "어떤 표상도 재현할 수 있는 붓질의 가호를",
  "어떤 논리도 발현할 수 있는 창의의 가호를",
  "어떤 상상도 실현할 수 있는 의지의 가호를",
];

export function ClubGoals() {
  return (
    <section className="bg-surface py-14">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">활동 목표</p>
          <h2 className="text-2xl font-semibold tracking-normal">
            졸업의 우리는 어썸하고 유니크한 크리에이터가 될 것입니다
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
                  할 수 있다고 믿는다면.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
