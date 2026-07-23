import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import type { Recruitment } from "../types";

type RecruitmentGuideProps = {
  recruitment: Recruitment;
};

const guideSections = [
  { key: "target", title: "모집 대상" },
  { key: "qualifications", title: "지원 자격" },
  { key: "activities", title: "주요 활동" },
] as const;

export function RecruitmentGuide({ recruitment }: RecruitmentGuideProps) {
  return (
    <section className="bg-surface py-14">
      <Container className="grid gap-5 md:grid-cols-3">
        {guideSections.map((section) => {
          const items = recruitment[section.key];

          if (items.length === 0) {
            return null;
          }

          return (
            <Card className="bg-background" key={section.key}>
              <CardContent className="space-y-4 p-6">
                <h2 className="text-xl font-semibold tracking-normal">
                  {section.title}
                </h2>
                <ul className="grid gap-3">
                  {items.map((item) => (
                    <li
                      className="text-sm leading-6 text-neutral-600 dark:text-neutral-300"
                      key={item}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </Container>
    </section>
  );
}
