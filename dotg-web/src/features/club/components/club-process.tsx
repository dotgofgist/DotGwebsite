import { Container } from "@/components/ui/container";

const processSteps = [
  "아이디어 회의",
  "역할 분담",
  "학기 중 개발",
  "학기 말 시연",
  "외부 행사 출품",
  "포트폴리오 적립",
];

export function ClubProcess() {
  return (
    <section className="bg-surface py-14">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">활동 방식</p>
          <h2 className="text-2xl font-semibold tracking-normal">
            팀 프로젝트는 이런 흐름으로 이어집니다
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            우리의 게임이 더더욱 간지가 나도록
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
