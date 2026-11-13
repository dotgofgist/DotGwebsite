import { redirect } from "next/navigation";
import { getAuthenticatedIdentity } from "@/features/auth/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PlayerAuthForm } from "./auth-form";
import { safePlayerReturnPath } from "./validation";
import styles from "./portal.module.css";

export async function PlayerAuthPage({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const returnTo = safePlayerReturnPath(next ?? "/account");
  if (await getAuthenticatedIdentity()) redirect(returnTo);
  return <div className={`${styles.portal} ${styles.authPage}`}>
    <header className={styles.heading}><span>DOTG · YOUR COMMUNITY</span><h1>{mode === "signup" ? "회원가입" : "로그인"}</h1><p>친구들과 함께할 나만의 공간을 만들어 보세요.</p></header>
    {isSupabaseConfigured() ? <PlayerAuthForm key={mode} initialMode={mode} returnTo={returnTo} standalone /> : <p className={styles.notice}>계정 서비스를 준비하고 있습니다. 잠시 후 다시 방문해 주세요.</p>}
  </div>;
}
