"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { SocialDashboard } from "./types";
import { ProfileSettings } from "./profile-settings";
import { FriendsPanel } from "./friends-panel";
import styles from "./portal.module.css";

function values(form: FormData): Record<string, string> {
  return Object.fromEntries([...form.entries()].map(([key, value]) => [key, String(value)]));
}

export function GamePortal({ email, view = "all" }: { email: string; view?: "all" | "profile" | "friends" }) {
  const router = useRouter();
  const [data, setData] = useState<SocialDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const refreshSequence = useRef(0);
  const refresh = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    const response = await fetch("/api/game/social", { cache: "no-store" });
    const result = await response.json();
    if (sequence !== refreshSequence.current) return;
    if (response.status === 401) { setData(null); router.refresh(); return; }
    if (!response.ok) throw new Error(result.error ?? "불러오지 못했습니다.");
    setData(result);
  }, [router]);
  useEffect(() => {
    let active = true;
    const reload = () => { if (document.visibilityState === "visible") void refresh().catch(error => { if (active) setMessage(error.message); }); };
    reload();
    const timer = setInterval(reload, 20000);
    window.addEventListener("focus", reload);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", reload); };
  }, [refresh]);

  async function act(action: string, payload: Record<string, string>, download = false) {
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/game/social", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, payload }) });
      const result = await response.json();
      if (response.status === 401) router.refresh();
      if (!response.ok) throw new Error(result.error ?? "처리하지 못했습니다.");
      if (download) {
        const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }));
        const anchor = document.createElement("a");
        anchor.href = url; anchor.download = `dotg-${result.mode}.tsb-session.json`;
        document.body.appendChild(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage(result.mode === "join" ? "참가 파일을 받았습니다. 5분 이내에 게임 실행 도우미로 열어 주세요." : "호스트 파일을 받았습니다. 게임 실행 도우미로 열어 방을 시작하세요. 이 파일은 공유하지 마세요.");
      } else {
        const feedback: Record<string, string> = { save_profile: "프로필을 저장했습니다.", accept_friend: "친구 요청을 수락했습니다.", remove_friend: "친구 관계 또는 요청을 삭제했습니다.", block_user: "사용자를 차단했습니다.", unblock_user: "차단을 해제했습니다." };
        const friendFeedback: Record<string, string> = { sent: "친구 요청을 보냈습니다.", accepted: "이미 친구인 사용자입니다.", incoming: "상대방이 보낸 요청이 있습니다. 받은 요청에서 수락해 주세요.", outgoing: "이미 친구 요청을 보냈습니다. 상대방의 수락을 기다려 주세요." };
        setMessage(action === "request_friend" ? friendFeedback[result.friend_status] ?? "친구 요청을 보냈습니다." : feedback[action] ?? "저장했습니다.");
      }
      await refresh();
      return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : "네트워크 연결을 확인해 주세요."); return false; }
    finally { setPending(false); }
  }
  async function signOut() {
    setPending(true);
    try {
      const { error } = await createBrowserSupabaseClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      setData(null); router.replace("/login"); router.refresh();
    } catch { setMessage("로그아웃하지 못했습니다. 다시 시도해 주세요."); }
    finally { setPending(false); }
  }
  async function changePhoto(file: File | null): Promise<boolean> {
    setPending(true); setMessage("");
    try {
      const body = new FormData();
      if (file) body.set("photo", file);
      const response = await fetch("/api/game/avatar", { method: file ? "POST" : "DELETE", ...(file ? { body } : {}) });
      const result = await response.json();
      if (response.status === 401) router.refresh();
      if (!response.ok) throw new Error(result.error ?? "사진을 변경하지 못했습니다.");
      await refresh();
      setMessage(result.cleanup_pending ? "사진을 변경했습니다. 이전 사진 파일 정리가 지연되고 있습니다." : file ? "프로필 사진을 변경했습니다." : "기본 프로필 사진으로 변경했습니다.");
      return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : "연결을 확인해 주세요."); return false; }
    finally { setPending(false); }
  }
  return <>
    <div className={styles.toolbar}><span className={styles.muted}>{email}</span><div className={styles.actions}><Link href="/play/password">비밀번호 변경</Link><button className={styles.secondary} disabled={pending} onClick={() => void signOut()}>로그아웃</button></div></div>
    <div role="status" aria-live="polite">{message && <p className={styles.notice}>{message}</p>}</div>
    {!data ? <section className={styles.card}><p>라운지를 불러오는 중입니다.</p><button className={styles.secondary} onClick={() => void refresh().catch(error => setMessage(error.message))}>다시 불러오기</button></section> : <div className={view === "all" ? styles.grid : styles.singleColumn}>
      {(view !== "friends" || !data.profile) && <aside className={styles.stack}>
        <ProfileSettings key={data.profile?.id ?? "new"} profile={data.profile} pending={pending} save={payload => act("save_profile", payload)} changePhoto={changePhoto} />
      </aside>}
      {view !== "profile" && <div className={styles.stack}>
        {!data.profile ? <section className={styles.card}><h2>친구와 함께 시작하세요</h2><p>프로필을 저장하면 친구를 추가하고 게임 초대를 주고받을 수 있어요.</p></section> : <>
          <FriendsPanel data={data} pending={pending} act={act} />
          {view === "all" && <>
          <section className={styles.card}><h2>받은 게임 초대</h2><p>초대는 15분 동안 유효하며 자동으로 갱신해서 보여 줍니다.</p>{data.invites.length === 0 && <p className={styles.empty}>새로운 게임 초대가 없어요.</p>}<div className={styles.list}>{data.invites.map(invite => <div className={styles.item} key={invite.id}><strong>{invite.title}</strong><p className={styles.muted}>{invite.host_name} 님의 초대 · {new Date(invite.expires_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}까지</p><div className={styles.actions}>{invite.status === "pending" ? <button disabled={pending} onClick={() => void act("accept_invite", { id: invite.id })}>초대 수락</button> : <button disabled={pending} onClick={() => void act("join_bundle", { id: invite.id }, true)}>참가 파일 받기</button>}<button className={styles.secondary} disabled={pending} onClick={() => void act("decline_invite", { id: invite.id })}>거절</button></div></div>)}</div></section>
          <section className={styles.card}><h2>함께 플레이하기</h2><p className={styles.notice}>EOS 방은 호스트와 참가자 모두 포트포워딩 없이 연결합니다. 게임에서 방 만들기 → F6으로 코드 복사 → 아래에 등록하세요. 직접 연결이 어려우면 EOS 중계를 사용합니다.</p>
            {data.rooms.length ? data.rooms.map(room => <div className={styles.item} key={room.id}><strong>{room.title}</strong><p className={styles.muted}>{room.endpoint} · 최대 2시간</p><div className={styles.actions}><button disabled={pending} onClick={() => void act("host_bundle", { session_id: room.id }, true)}>호스트 파일 받기</button><button className={styles.secondary} disabled={pending} onClick={() => void act("close_room", { session_id: room.id })}>초대 마감</button></div><p className={styles.muted}>게임을 종료하면 플레이도 끝납니다. 초대 마감은 이미 접속한 플레이어를 내보내지 않습니다.</p></div>) : <form className={styles.form} action={async form => { await act("create_room", values(form)); }}><label>방 이름<input name="title" required maxLength={60} placeholder="오늘의 동아리 게임" /></label><label>EOS 방 코드 또는 LAN 주소<input name="endpoint" required maxLength={260} placeholder="게임에서 F6으로 복사한 eos:… 방 코드" /></label><button disabled={pending}>방 만들기</button></form>}
            <p className={styles.muted}>호스트는 코드를 복사한 게임을 종료한 뒤 호스트 파일로 다시 실행하고 친구를 초대하세요. 받은 파일은 게임 폴더의 scripts/Start-OnlineGame.ps1로 여세요. 참가 파일은 5분 이내에 사용하고, 사용 후 삭제해 주세요.</p>
          </section>
          </>}
        </>}
      </div>}
    </div>}
  </>;
}
