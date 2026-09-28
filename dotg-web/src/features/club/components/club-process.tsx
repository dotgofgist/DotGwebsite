import { Container } from "@/components/ui/container";

const processSteps = [
  "관심사와 아이디어 공유",
  "자유로운 팀 구성",
  "역할 분담과 기획",
  "학기 중 개발",
  "플레이와 개선",
  "성과 발표와 공유",
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
            관심사가 맞는 부원들과 팀을 만들고, 학기 동안 게임을 개발한 뒤
            완성한 작품과 성장 과정을 함께 나눕니다.
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
