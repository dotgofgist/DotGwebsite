"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { SocialDashboard, Relationship } from "./types";
import styles from "./portal.module.css";

function values(form: FormData): Record<string, string> {
  return Object.fromEntries([...form.entries()].map(([key, value]) => [key, String(value)]));
}

export function GamePortal({ email }: { email: string }) {
  const router = useRouter();
  const [data, setData] = useState<SocialDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const refresh = useCallback(async () => {
    const response = await fetch("/api/game/social", { cache: "no-store" });
    const result = await response.json();
    if (response.status === 401) { router.refresh(); return; }
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
      } else { setMessage("저장했습니다."); }
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "네트워크 연결을 확인해 주세요."); }
    finally { setPending(false); }
  }
  async function signOut() {
    setPending(true);
    try {
      const { error } = await createBrowserSupabaseClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      router.refresh();
    } catch { setMessage("로그아웃하지 못했습니다. 다시 시도해 주세요."); }
    finally { setPending(false); }
  }
  function person(item: Relationship) {
    return <div className={styles.identity}><span className={styles.avatar} data-color={item.avatar} aria-hidden="true">{[...item.display_name][0]}</span><div><strong>{item.display_name}</strong><small>@{item.handle}</small></div></div>;
  }

  const friends = data?.relationships.filter(item => item.status === "accepted") ?? [];
  const requests = data?.relationships.filter(item => item.status === "pending") ?? [];
  return <>
    <div className={styles.toolbar}><span className={styles.muted}>{email}</span><div className={styles.actions}><Link href="/play/password">비밀번호 변경</Link><button className={styles.secondary} disabled={pending} onClick={() => void signOut()}>로그아웃</button></div></div>
    <div role="status" aria-live="polite">{message && <p className={styles.notice}>{message}</p>}</div>
    {!data ? <section className={styles.card}><p>라운지를 불러오는 중입니다.</p><button className={styles.secondary} onClick={() => void refresh().catch(error => setMessage(error.message))}>다시 불러오기</button></section> : <div className={styles.grid}>
      <aside className={styles.stack}>
        <section className={styles.card} id="profile"><h2>{data.profile ? "내 게임 프로필" : "첫 프로필 만들기"}</h2><p>사용자 ID로 친구를 찾을 수 있어요.</p>
          <form className={styles.form} action={form => act("save_profile", values(form))} key={data.profile?.id ?? "new"}>
            <label>사용자 ID<input name="handle" defaultValue={data.profile?.handle} required pattern="[a-z0-9_]{3,24}" minLength={3} maxLength={24} autoCapitalize="none" spellCheck={false} placeholder="dotg_player" /><small className={styles.muted}>영문 소문자·숫자·밑줄, 3~24자</small></label>
            <label>닉네임<input name="display_name" defaultValue={data.profile?.display_name} required maxLength={32} placeholder="게임에서 사용할 이름" /></label>
            <label>소개<textarea name="bio" defaultValue={data.profile?.bio} maxLength={240} placeholder="좋아하는 게임이나 짧은 인사" /></label>
            <label>프로필 색상<select name="avatar" defaultValue={data.profile?.avatar ?? "coral"}><option value="coral">코랄</option><option value="mint">민트</option><option value="blue">블루</option><option value="violet">바이올렛</option></select></label>
            <button disabled={pending}>프로필 저장</button>
          </form>
        </section>
        {data.profile && <section className={styles.card}><h2>차단 관리</h2><form className={styles.form} action={form => act("block_user", values(form))}><label>사용자 ID<input name="handle" required minLength={3} maxLength={24} placeholder="차단할 사용자 ID" /></label><button className={styles.secondary} disabled={pending}>사용자 차단</button></form><div className={styles.list}>{data.blocks.map(item => <div key={item.user_id} className={styles.item}><span>{item.display_name} · @{item.handle}</span><button className={styles.secondary} disabled={pending} onClick={() => void act("unblock_user", { user_id: item.user_id })}>차단 해제</button></div>)}</div></section>}
      </aside>
      <div className={styles.stack}>
        {!data.profile ? <section className={styles.card}><h2>친구와 함께 시작하세요</h2><p>프로필을 저장하면 친구를 추가하고 게임 초대를 주고받을 수 있어요.</p></section> : <>
          <section className={styles.card} id="friends"><h2>친구 <span className={styles.muted}>{friends.length}</span></h2>
            <form className={styles.row} action={form => act("request_friend", values(form))}><label>친구 사용자 ID<input name="handle" required minLength={3} maxLength={24} placeholder="친구의 사용자 ID" autoCapitalize="none" /></label><button disabled={pending}>요청 보내기</button></form>
            {requests.length > 0 && <><h3>친구 요청</h3><div className={styles.list}>{requests.map(item => <div className={styles.item} key={item.id}>{person(item)}<div className={styles.actions}>{item.incoming ? <button disabled={pending} onClick={() => void act("accept_friend", { id: item.id })}>수락</button> : <span className={styles.muted}>수락을 기다리는 중</span>}<button className={styles.secondary} disabled={pending} onClick={() => void act("remove_friend", { id: item.id })}>{item.incoming ? "거절" : "요청 취소"}</button></div></div>)}</div></>}
            <h3>내 친구</h3>{friends.length === 0 && <p className={styles.empty}>아직 친구가 없어요. 사용자 ID로 첫 친구를 추가해 보세요.</p>}<div className={styles.list}>{friends.map(item => <div className={styles.item} key={item.id}>{person(item)}{item.bio && <p className={styles.muted}>{item.bio}</p>}<div className={styles.actions}>{data.rooms[0] && <button disabled={pending} onClick={() => void act("invite_friend", { session_id: data.rooms[0].id, user_id: item.user_id })}>내 방에 초대</button>}<button className={styles.secondary} disabled={pending} onClick={() => void act("remove_friend", { id: item.id })}>친구 삭제</button></div></div>)}</div>
          </section>
          <section className={styles.card}><h2>받은 게임 초대</h2><p>초대는 15분 동안 유효하며 자동으로 갱신해서 보여 줍니다.</p>{data.invites.length === 0 && <p className={styles.empty}>새로운 게임 초대가 없어요.</p>}<div className={styles.list}>{data.invites.map(invite => <div className={styles.item} key={invite.id}><strong>{invite.title}</strong><p className={styles.muted}>{invite.host_name} 님의 초대 · {new Date(invite.expires_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}까지</p><div className={styles.actions}>{invite.status === "pending" ? <button disabled={pending} onClick={() => void act("accept_invite", { id: invite.id })}>초대 수락</button> : <button disabled={pending} onClick={() => void act("join_bundle", { id: invite.id }, true)}>참가 파일 받기</button>}<button className={styles.secondary} disabled={pending} onClick={() => void act("decline_invite", { id: invite.id })}>거절</button></div></div>)}</div></section>
          <section className={styles.card}><h2>함께 플레이하기</h2><p className={styles.notice}>현재는 직접 접속 테스트를 지원합니다. 같은 네트워크나 외부에서 접속 가능한 호스트가 필요합니다. 인터넷 자동 연결은 준비 중입니다.</p>
            {data.rooms.length ? data.rooms.map(room => <div className={styles.item} key={room.id}><strong>{room.title}</strong><p className={styles.muted}>{room.endpoint} · 최대 2시간</p><div className={styles.actions}><button disabled={pending} onClick={() => void act("host_bundle", { session_id: room.id }, true)}>호스트 파일 받기</button><button className={styles.secondary} disabled={pending} onClick={() => void act("close_room", { session_id: room.id })}>초대 마감</button></div><p className={styles.muted}>게임을 종료하면 플레이도 끝납니다. 초대 마감은 이미 접속한 플레이어를 내보내지 않습니다.</p></div>) : <form className={styles.form} action={form => act("create_room", values(form))}><label>방 이름<input name="title" required maxLength={60} placeholder="오늘의 동아리 게임" /></label><label>호스트 접속 주소<input name="endpoint" required maxLength={260} placeholder="192.168.0.10:28080" /></label><button disabled={pending}>방 만들기</button></form>}
            <p className={styles.muted}>받은 파일은 게임 폴더의 Start-OnlineGame.ps1 실행 도우미로 여세요. 참가 파일은 5분 이내에 사용하고, 사용 후 삭제해 주세요.</p>
          </section>
        </>}
      </div>
    </div>}
  </>;
}
