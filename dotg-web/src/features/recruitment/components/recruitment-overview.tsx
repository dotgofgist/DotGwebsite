import { Container } from "@/components/ui/container";
import type { Recruitment } from "../types";
import { ApplicationButton } from "./application-button";
import { RecruitmentStatus } from "./recruitment-status";

type RecruitmentOverviewProps = {
  recruitment: Recruitment;
};

export function RecruitmentOverview({ recruitment }: RecruitmentOverviewProps) {
  return (
    <section className="border-b border-border bg-background py-16">
      <Container className="grid gap-8 lg:grid-cols-[1fr_0.45fr] lg:items-center">
        <div className="space-y-5">
          <RecruitmentStatus status={recruitment.status} showDescription />
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
              {recruitment.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
              {recruitment.summary}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <ApplicationButton recruitment={recruitment} />
        </div>
      </Container>
    </section>
  );
}
