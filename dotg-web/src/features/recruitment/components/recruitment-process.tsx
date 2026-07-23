import { Container } from "@/components/ui/container";
import type { Recruitment } from "../types";

type RecruitmentProcessProps = {
  recruitment: Recruitment;
};

export function RecruitmentProcess({ recruitment }: RecruitmentProcessProps) {
  if (recruitment.process.length === 0) {
    return null;
  }

  return (
    <section className="py-14">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">지원 절차</p>
          <h2 className="text-2xl font-semibold tracking-normal">
            안내된 절차에 따라 지원을 준비합니다
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            실제 모집 방식이 확정되면 각 단계의 세부 안내가 함께 업데이트됩니다.
          </p>
        </div>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recruitment.process.map((step, index) => (
            <li
              className="rounded-lg border border-border bg-surface p-5"
              key={step.title}
            >
              <p className="text-sm font-semibold text-primary">
                {index + 1}. 단계
              </p>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
