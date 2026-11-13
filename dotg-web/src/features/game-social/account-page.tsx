import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedIdentity } from "@/features/auth/server";
import { GamePortal } from "./portal";
import styles from "./portal.module.css";

export async function PlayerAccountPage({ view }: { view: "profile" | "friends" }) {
  const identity = await getAuthenticatedIdentity();
  if (!identity) redirect(`/login?next=${view === "profile" ? "/account" : "/friends"}`);
  return <div className={styles.portal}>
    <header className={styles.heading}><span>DOTG · MY SPACE</span><h1>{view === "profile" ? "프로필 설정" : "친구"}</h1><p>{view === "profile" ? "나를 표현하는 닉네임과 사진을 설정하세요." : "친구를 찾고, 요청을 주고받고, 함께 플레이하세요."}</p></header>
    <nav className={styles.tabs} aria-label="내 계정 메뉴"><Link href="/account" aria-current={view === "profile" ? "page" : undefined}>프로필 설정</Link><Link href="/friends" aria-current={view === "friends" ? "page" : undefined}>친구 관리</Link><Link href="/play">플레이어 라운지 ↗</Link></nav>
    <GamePortal email={identity.email ?? ""} view={view} />
  </div>;
}
