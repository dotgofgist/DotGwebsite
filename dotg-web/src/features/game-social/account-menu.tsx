"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AccountMenu() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const db = createBrowserSupabaseClient();
    const { data } = db.auth.onAuthStateChange((event, session) => {
      setSignedIn(Boolean(session));
      if (event === "SIGNED_OUT") router.refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [router]);
  async function logout() {
    setPending(true); setMessage("");
    try {
      const { error } = await createBrowserSupabaseClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      setSignedIn(false); router.replace("/login"); router.refresh();
    } catch { setMessage("로그아웃하지 못했습니다. 다시 시도해 주세요."); }
    finally { setPending(false); }
  }
  const linkClass = "inline-flex min-h-10 items-center rounded-md px-3 text-sm hover:bg-surface focus-visible:bg-surface";
  return <nav aria-label="계정 메뉴" className="flex flex-wrap items-center justify-end gap-1">
    {signedIn ? <><Link className={linkClass} href="/account">프로필 설정</Link><Link className={linkClass} href="/friends">친구</Link><button type="button" className={linkClass} disabled={pending} onClick={() => void logout()}>{pending ? "로그아웃 중…" : "로그아웃"}</button></> : <><Link className={linkClass} href="/login">로그인</Link><Link className={`${linkClass} font-semibold text-primary`} href="/signup">회원가입</Link></>}
    {message && <p role="alert" className="w-full text-right text-sm">{message}</p>}
  </nav>;
}
