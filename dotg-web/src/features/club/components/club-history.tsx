import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const futureRecords = ["프로젝트", "게임잼", "발표와 회고"];

export function ClubHistory() {
  return (
    <section className="py-14">
      <Container>
        <Card>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-semibold text-primary">활동 기록</p>
              <h2 className="text-2xl font-semibold tracking-normal">
                주요 활동을 순차적으로 기록할 예정입니다
              </h2>
              <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                프로젝트, 게임잼, 발표와 같은 주요 활동을 이곳에 정리합니다.
                실제 날짜와 기록이 확인된 뒤 연혁 형태로 확장할 수 있습니다.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-3">
              {futureRecords.map((record) => (
                <li
                  className="rounded-md border border-border bg-background p-4 text-sm font-semibold"
                  key={record}
                >
                  {record}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
