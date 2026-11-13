"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { safePlayerReturnPath, validateSocialRequest } from "./validation";
import styles from "./portal.module.css";

export function PlayerAuthForm({ passwordOnly = false, initialMode = "login", returnTo = "/play", standalone = false }: { passwordOnly?: boolean; initialMode?: "login" | "signup"; returnTo?: string; standalone?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "reset">(initialMode);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const destination = safePlayerReturnPath(returnTo);
  function complete() { router.replace(destination); router.refresh(); }
  function changeMode(nextMode: "login" | "signup" | "reset") {
    if (standalone && nextMode !== "reset" && nextMode !== initialMode) {
      router.push(`/${nextMode}?next=${encodeURIComponent(destination)}`);
    } else { setMode(nextMode); setMessage(""); setFailed(false); }
  }
  async function submit(form: FormData) {
    setPending(true); setMessage(""); setFailed(false);
    try {
      const db = createBrowserSupabaseClient();
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      if ((passwordOnly || mode === "signup") && password !== form.get("password_confirm")) throw new Error("비밀번호가 서로 일치하지 않습니다.");
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
        const { payload } = validateSocialRequest({ action: "save_profile", payload: { handle: form.get("handle"), real_name: form.get("real_name"), display_name: form.get("display_name"), bio: "", avatar: "coral" } });
        const { data, error } = await db.auth.signUp({ email, password, options: { data: { handle: payload.handle, real_name: payload.real_name, display_name: payload.display_name }, emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(destination)}` } });
        if (error) throw new Error(error.code === "unexpected_failure" ? "이미 사용 중인 사용자 ID일 수 있습니다. 다른 ID로 다시 시도해 주세요." : "가입하지 못했습니다. 사용자 ID·이메일·비밀번호를 확인하거나 잠시 후 다시 시도해 주세요.");
        if (data.session) complete();
        else setMessage("이메일로 도착한 확인 링크를 열어 가입을 완료해 주세요. 이미 가입했다면 로그인해 주세요.");
      } else {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw new Error("이메일·비밀번호와 이메일 인증 여부를 확인해 주세요.");
        complete();
      }
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "연결을 확인하고 다시 시도해 주세요."); }
    finally { setPending(false); }
  }
  return <section className={styles.card}>
    <h2>{passwordOnly ? "새 비밀번호" : mode === "signup" ? "DotG 계정 만들기" : mode === "reset" ? "비밀번호 재설정" : "DotG 로그인"}</h2>
    <p>하나의 계정으로 게임 프로필과 친구를 관리하세요.</p>
    <form onSubmit={event => { event.preventDefault(); if (!pending) void submit(new FormData(event.currentTarget)); }} className={styles.form} key={passwordOnly ? "password" : mode} aria-busy={pending}>
      {!passwordOnly && mode === "signup" && <>
        <label>이름<input name="real_name" autoComplete="name" required maxLength={50} placeholder="이름" /><small className={styles.muted}>본인 설정에만 표시하며 친구에게 공개하지 않습니다.</small></label>
        <label>닉네임<input name="display_name" autoComplete="nickname" required maxLength={32} placeholder="친구와 게임에 표시할 닉네임" /></label>
        <label>사용자 ID<input name="handle" autoComplete="username" autoCapitalize="none" spellCheck={false} required pattern="[A-Za-z0-9_]{3,24}" minLength={3} maxLength={24} placeholder="dotg_player" /><small className={styles.muted}>친구가 찾을 수 있는 고유 ID · 영문·숫자·밑줄 3~24자</small></label>
      </>}
      {!passwordOnly && <label>이메일<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
      {(passwordOnly || mode !== "reset") && <label>비밀번호<input name="password" type="password" autoComplete={passwordOnly || mode === "signup" ? "new-password" : "current-password"} required minLength={passwordOnly || mode === "signup" ? 8 : 1} maxLength={128} /></label>}
      {(passwordOnly || mode === "signup") && <label>비밀번호 확인<input name="password_confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /><small className={styles.muted}>8자 이상으로 입력해 주세요.</small></label>}
      <button disabled={pending}>{pending ? "처리 중…" : passwordOnly ? "비밀번호 저장" : mode === "signup" ? "가입하기" : mode === "reset" ? "재설정 메일 보내기" : "로그인"}</button>
    </form>
    <p role={failed ? "alert" : "status"} aria-live="polite">{message}</p>
    {!passwordOnly && <div className={styles.actions}>{([['login','로그인'],['signup','회원가입'],['reset','비밀번호 찾기']] as const).filter(([key]) => key !== mode).map(([key,label]) => <button className={styles.secondary} disabled={pending} key={key} onClick={() => changeMode(key)}>{label}</button>)}</div>}
  </section>;
}
