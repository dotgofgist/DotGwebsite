"use client";
import { useState } from "react";
import type { PlayerSearchResult, Relationship, SocialDashboard } from "./types";
import { PlayerAvatar } from "./avatar-image";
import styles from "./portal.module.css";

export type SocialAction = (action: string, payload: Record<string, string>, download?: boolean) => Promise<boolean>;

export function FriendsPanel({ data, pending, act }: { data: SocialDashboard; pending: boolean; act: SocialAction }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const friends = data.relationships.filter(item => item.status === "accepted");
  const incoming = data.relationships.filter(item => item.status === "pending" && item.incoming);
  const outgoing = data.relationships.filter(item => item.status === "pending" && !item.incoming);
  async function search() {
    setSearching(true); setError(""); setResults(null);
    try {
      const response = await fetch("/api/game/social", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "search_players", payload: { query: query.trim() } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "친구를 검색하지 못했습니다.");
      setResults(result);
    } catch (error) { setError(error instanceof Error ? error.message : "연결을 확인해 주세요."); }
    finally { setSearching(false); }
  }
  function person(item: PlayerSearchResult | Relationship) {
    return <div className={styles.identity}><PlayerAvatar name={item.display_name} color={item.avatar} path={item.avatar_path} /><div><strong>{item.display_name}</strong><small>@{item.handle}</small></div></div>;
  }
  function requestList(items: Relationship[], received: boolean) {
    return <><h3>{received ? "받은 요청" : "보낸 요청"} <span className={styles.muted}>{items.length}</span></h3>{!items.length && <p className={styles.empty}>{received ? "받은 친구 요청이 없습니다." : "대기 중인 요청이 없습니다."}</p>}<div className={styles.list}>{items.map(item => <div className={styles.item} key={item.id}>{person(item)}<div className={styles.actions}>{received ? <button disabled={pending} onClick={() => void act("accept_friend", { id: item.id })}>수락</button> : <span className={styles.muted}>수락 대기 중</span>}<button className={styles.secondary} disabled={pending} onClick={() => void act("remove_friend", { id: item.id })}>{received ? "거절" : "요청 취소"}</button></div></div>)}</div></>;
  }
  return <>
    <section className={styles.card} id="friends"><h2>친구 추가</h2><p>사용자 ID 또는 닉네임으로 검색하고 친구 요청을 보내세요.</p>
      <form className={styles.row} onSubmit={event => { event.preventDefault(); void search(); }}><label>친구 검색<input value={query} onChange={event => setQuery(event.target.value)} required minLength={2} maxLength={32} placeholder="사용자 ID 또는 닉네임" autoCapitalize="none" /></label><button disabled={pending || searching}>{searching ? "검색 중…" : "검색"}</button></form>
      <div role="status" aria-live="polite">{error || (results?.length === 0 ? "검색 결과가 없습니다. 사용자 ID나 닉네임을 확인해 주세요." : results ? `${results.length}명을 찾았습니다.` : "")}</div>
      <div className={styles.list}>{results?.filter(item => !data.blocks.some(block => block.user_id === item.id)).map(item => {
        const relationship = data.relationships.find(friend => friend.user_id === item.id);
        return <div key={item.id} className={styles.item}>{person(item)}{item.bio && <p className={styles.muted}>{item.bio}</p>}<div className={styles.actions}>{relationship ? <span className={styles.muted}>{relationship.status === "accepted" ? "이미 친구입니다" : relationship.incoming ? "받은 요청에서 수락해 주세요" : "친구 요청을 보냈습니다"}</span> : <button disabled={pending} onClick={() => void act("request_friend", { handle: item.handle })}>친구 추가</button>}</div></div>;
      })}</div>
    </section>
    <section className={styles.card}><h2>친구 요청</h2>{requestList(incoming, true)}{requestList(outgoing, false)}</section>
    <section className={styles.card}><h2>내 친구 <span className={styles.muted}>{friends.length}</span></h2>{!friends.length && <p className={styles.empty}>아직 친구가 없어요. 첫 친구를 추가해 보세요.</p>}<div className={styles.list}>{friends.map(item => <div className={styles.item} key={item.id}>{person(item)}{item.bio && <p className={styles.muted}>{item.bio}</p>}<div className={styles.actions}>{data.rooms[0] && <button disabled={pending} onClick={() => void act("invite_friend", { session_id: data.rooms[0].id, user_id: item.user_id })}>내 방에 초대</button>}<button className={styles.secondary} disabled={pending} onClick={() => void act("remove_friend", { id: item.id })}>친구 삭제</button><button className={styles.secondary} disabled={pending} onClick={() => void act("block_user", { handle: item.handle })}>차단</button></div></div>)}</div></section>
    <section className={styles.card}><h2>차단 관리</h2><form className={styles.row} onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void act("block_user", { handle: String(form.get("handle") ?? "") }); }}><label>차단할 사용자 ID<input name="handle" required minLength={3} maxLength={24} autoCapitalize="none" placeholder="사용자 ID" /></label><button className={styles.secondary} disabled={pending}>사용자 차단</button></form>{!data.blocks.length && <p className={styles.empty}>차단한 사용자가 없습니다.</p>}<div className={styles.list}>{data.blocks.map(item => <div className={styles.item} key={item.user_id}><span>{item.display_name} · @{item.handle}</span><button className={styles.secondary} disabled={pending} onClick={() => void act("unblock_user", { user_id: item.user_id })}>차단 해제</button></div>)}</div></section>
  </>;
}
