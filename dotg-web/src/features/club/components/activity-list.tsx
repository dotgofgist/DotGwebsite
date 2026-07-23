import { Container } from "@/components/ui/container";

const activities = [
  {
    title: "아이디어 발굴과 게임 기획",
    description: "핵심 재미, 규칙, 플레이 흐름을 말과 문서로 정리합니다.",
  },
  {
    title: "프로토타입 제작",
    description: "작은 범위로 빠르게 만들어 아이디어의 가능성을 확인합니다.",
  },
  {
    title: "프로그래밍",
    description: "게임 로직, 화면 전환, 입력 처리처럼 실제 동작을 구현합니다.",
  },
  {
    title: "그래픽 및 UI 제작",
    description: "플레이어가 보고 조작하는 화면 요소를 제작하고 다듬습니다.",
  },
  {
    title: "사운드 제작",
    description: "상황에 맞는 효과음과 음악으로 게임의 감각을 보완합니다.",
  },
  {
    title: "테스트와 피드백",
    description: "직접 플레이하며 문제를 찾고 개선 방향을 함께 논의합니다.",
  },
  {
    title: "발표와 회고",
    description: "결과물과 제작 과정을 공유하고 다음 프로젝트의 힌트를 얻습니다.",
  },
];

export function ActivityList() {
  return (
    <section className="py-14">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">주요 활동 분야</p>
          <h2 className="text-2xl font-semibold tracking-normal">
            역할과 관심사에 따라 참여할 수 있습니다
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            한 사람이 모든 분야를 맡기보다, 관심 있는 영역을 중심으로 서로
            배우고 연결하는 방식을 지향합니다.
          </p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {activities.map((activity) => (
            <li
              className="rounded-lg border border-border bg-surface p-5"
              key={activity.title}
            >
              <h3 className="text-base font-semibold">{activity.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {activity.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
