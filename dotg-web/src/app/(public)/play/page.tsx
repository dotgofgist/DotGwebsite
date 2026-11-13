import type { Metadata } from "next";
import { getAuthenticatedIdentity } from "@/features/auth/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PlayerAuthForm } from "@/features/game-social/auth-form";
import { GamePortal } from "@/features/game-social/portal";
import { RoomList } from "@/features/game-social/room-list";
import styles from "@/features/game-social/portal.module.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "플레이어 라운지 | DotG", robots: { index: false, follow: false } };

export default async function PlayPage({ searchParams }: { searchParams: Promise<{ auth_error?: string; connect?: string }> }) {
  const configured = isSupabaseConfigured();
  const identity = configured ? await getAuthenticatedIdentity() : null;
  const query = await searchParams;
  return <div className={styles.portal}>
    <header className={styles.heading}><span>DOTG · PLAY TOGETHER</span><h1>플레이어 라운지</h1><p>나를 소개하고, 친구를 만나고, 함께 플레이하세요.</p></header>
    {query.auth_error && <p role="alert" className={styles.notice}>인증 링크가 만료되었거나 올바르지 않습니다. 다시 로그인하거나 재설정 메일을 요청해 주세요.</p>}
    {configured && <RoomList signedIn={Boolean(identity)} connectionCode={/^[A-F0-9]{8}$/.test(query.connect ?? "") ? query.connect : ""} />}
    {!configured ? <p className={styles.notice}>계정 서비스를 준비하고 있습니다. 잠시 후 다시 방문해 주세요.</p> : identity ? <GamePortal email={identity.email ?? ""} /> : <PlayerAuthForm />}
  </div>;
}
