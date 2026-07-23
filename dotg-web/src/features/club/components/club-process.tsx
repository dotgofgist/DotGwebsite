import { Container } from "@/components/ui/container";

const processSteps = [
  "아이디어 제안",
  "팀 구성",
  "기획 및 프로토타입",
  "개발 및 제작",
  "테스트와 수정",
  "발표와 회고",
];

export function ClubProcess() {
  return (
    <section className="bg-surface py-14">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">활동 방식</p>
          <h2 className="text-2xl font-semibold tracking-normal">
            프로젝트는 이런 흐름으로 진행할 수 있습니다
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            아래 흐름은 게임 제작 프로젝트를 진행할 때 참고할 수 있는 일반적인
            과정입니다.
          </p>
        </div>
        <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step, index) => (
            <li
              className="rounded-lg border border-border bg-background p-5"
              key={step}
            >
              <p className="text-sm font-semibold text-primary">
                {index + 1}. 단계
              </p>
              <h3 className="mt-2 text-lg font-semibold">{step}</h3>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
