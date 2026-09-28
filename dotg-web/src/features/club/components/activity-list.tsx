import { Container } from "@/components/ui/container";

const activities = [
  {
    title: "게임잼",
    description: "정해진 가이드라인 안에서 아이디어를 게임으로 구현하며 개발의 첫걸음을 내딛습니다.",
  },
  {
    title: "학기별 팀 프로젝트",
    description: "자유롭게 팀을 이루어 한 학기 동안 원하는 게임을 꾸준히 기획하고 개발합니다.",
  },
  {
    title: "게임 개발 스터디",
    description: "선배와 동료가 함께 공부하며 Unity를 비롯한 게임 개발 지식을 쌓습니다.",
  },
  {
    title: "친목 행사",
    description: "게임을 좋아한다는 공통 관심사를 바탕으로 다양한 주제의 활동을 함께 즐깁니다.",
  },
  {
    title: "외부 게임잼과 대회",
    description: "교외 행사와 대회에 참가해 새로운 사람들과 만나고 개발 경험의 폭을 넓힙니다.",
  },
  {
    title: "주간·학기말 성과 발표",
    description: "각자의 완성품과 진행 과정을 소개하며 서로의 성장을 확인합니다.",
  },
];

export function ActivityList() {
  return (
    <section className="py-14">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold text-primary">주요 활동 분야</p>
          <h2 className="text-2xl font-semibold tracking-normal">
            제작과 배움, 교류와 도전을 함께합니다
          </h2>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            기획, 프로그래밍, 디자인 등 각자의 관심 분야로 참여하고, 다양한
            활동을 통해 함께 배우며 게임 개발 경험을 넓혀갑니다.
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
