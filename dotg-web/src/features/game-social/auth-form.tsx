"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import styles from "./portal.module.css";

export function PlayerAuthForm({ passwordOnly = false }: { passwordOnly?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(form: FormData) {
    setPending(true); setMessage("");
    try {
      const db = createBrowserSupabaseClient();
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      if (passwordOnly) {
        const { error } = await db.auth.updateUser({ password });
        if (error) throw new Error("비밀번호를 변경하지 못했습니다. 재설정 링크를 다시 요청해 주세요.");
        router.replace("/play"); router.refresh(); return;
      }
      if (mode === "reset") {
        const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/play/password` });
        if (error) throw new Error("메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setMessage("가입된 이메일이면 비밀번호 재설정 안내를 보냈습니다.");
      } else if (mode === "signup") {
        const { data, error } = await db.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback?next=/play` } });
        if (error) throw new Error("가입하지 못했습니다. 이메일·비밀번호를 확인하거나 잠시 후 다시 시도해 주세요.");
        if (data.session) router.refresh();
        else setMessage("이메일로 도착한 확인 링크를 열어 가입을 완료해 주세요. 이미 가입했다면 로그인해 주세요.");
      } else {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw new Error("이메일·비밀번호와 이메일 인증 여부를 확인해 주세요.");
        router.refresh();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "연결을 확인하고 다시 시도해 주세요."); }
    finally { setPending(false); }
  }
  return <section className={styles.card}>
    <h2>{passwordOnly ? "새 비밀번호" : mode === "signup" ? "DotG 계정 만들기" : mode === "reset" ? "비밀번호 재설정" : "DotG 로그인"}</h2>
    <p>하나의 계정으로 게임 프로필과 친구를 관리하세요.</p>
    <form action={submit} className={styles.form}>
      {!passwordOnly && <label>이메일<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
      {(passwordOnly || mode !== "reset") && <label>비밀번호<input name="password" type="password" autoComplete={passwordOnly || mode === "signup" ? "new-password" : "current-password"} required minLength={passwordOnly || mode === "signup" ? 8 : 1} maxLength={128} /></label>}
      <button disabled={pending}>{pending ? "처리 중…" : passwordOnly ? "비밀번호 저장" : mode === "signup" ? "가입하기" : mode === "reset" ? "재설정 메일 보내기" : "로그인"}</button>
    </form>
    <p role="status" aria-live="polite">{message}</p>
    {!passwordOnly && <div className={styles.actions}>{([['login','로그인'],['signup','회원가입'],['reset','비밀번호 찾기']] as const).filter(([key]) => key !== mode).map(([key,label]) => <button className={styles.secondary} disabled={pending} key={key} onClick={() => { setMode(key); setMessage(""); }}>{label}</button>)}</div>}
  </section>;
}
