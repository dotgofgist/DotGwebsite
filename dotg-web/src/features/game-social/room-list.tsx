"use client";
import { useCallback, useEffect, useState } from "react";
import type { ListedRoom } from "./rooms";
import styles from "./portal.module.css";

export function RoomList({ signedIn, connectionCode = "" }: { signedIn: boolean; connectionCode?: string }) {
  const [rooms, setRooms] = useState<ListedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const refresh = useCallback((signal?: AbortSignal) => {
    return fetch("/api/game/rooms", { cache: "no-store", signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    }).then(data => {
      if (signal?.aborted) return;
      setRooms(data.rooms); setError("");
    }).catch(e => { if (!signal?.aborted) { setRooms([]); setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다."); } })
      .finally(() => { if (!signal?.aborted) setLoading(false); });
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const timer = setInterval(() => { if (!document.hidden) void refresh(controller.signal); }, 15000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [refresh]);
  async function act(action: string, code: string) {
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/game/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, payload: { code } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (action === "join") {
        const url = URL.createObjectURL(new Blob([JSON.stringify(data.session, null, 2)], { type: "application/json" }));
        const link = document.createElement("a"); link.href = url; link.download = "dotg-join.tsb-session.json"; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage("참가 파일을 받았어요. 게임 실행 도우미로 5분 안에 열어 주세요. 실행 중인 게임에서는 방 코드를 입력해 바로 참여할 수 있어요.");
      } else setMessage("게임 계정을 연결했어요. 게임으로 돌아가 주세요.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "요청을 처리하지 못했습니다."); }
    finally { setPending(false); }
  }
  return <section className={`${styles.card} ${styles.roomDirectory}`} id="rooms">
    <div className={styles.toolbar}><div><h2>방 목록</h2><p className={styles.muted}>게임에서 만든 방을 15초마다 불러옵니다.</p></div><button className={styles.secondary} disabled={pending} onClick={() => void refresh()}>새로고침</button></div>
    {signedIn ? <details open={Boolean(connectionCode)}><summary>실행 중인 게임과 계정 연결</summary><p className={styles.muted}>내 게임 화면에 표시된 연결 코드인지 확인한 뒤 승인해 주세요. 연결 권한은 12시간 동안 유효합니다.</p><form className={styles.row} action={data => act("link_approve", String(data.get("code")))}><label>게임 연결 코드<input name="code" defaultValue={connectionCode} required maxLength={9} pattern="[a-fA-F0-9-]{8,9}" placeholder="게임에 표시된 8자리" autoComplete="off" /></label><button disabled={pending}>연결 승인</button></form></details> : <p className={styles.notice}>목록은 바로 볼 수 있어요. 방 참여와 게임 계정 연결은 아래에서 로그인한 뒤 이용해 주세요.</p>}
    <div role="status" aria-live="polite">{message && <p className={styles.notice}>{message}</p>}</div>
    {error ? <p role="alert" className={styles.notice}>{error}</p> : loading ? <p className={styles.empty}>방 목록을 불러오는 중이에요.</p> : rooms.length === 0 ? <p className={styles.empty}>아직 열린 방이 없어요. 게임에서 첫 방을 만들어 보세요.</p> : <div className={styles.roomTableWrap}><table className={styles.roomTable}><caption className={styles.muted}>현재 열린 방 {rooms.length}개 · 실제 플레이어 기준</caption><thead><tr><th scope="col">방 / 방장</th><th scope="col">맵</th><th scope="col">인원</th><th scope="col">상태</th><th scope="col">방 코드</th><th scope="col">참여</th></tr></thead><tbody>{rooms.map(room => <tr key={room.code}><td><strong>{room.title}</strong><small>{room.host_name}</small></td><td>{room.map_id === "elf-city" ? "엘프 도시" : "요정왕국 성"}</td><td>{room.players}/{room.capacity}</td><td>{room.state === "waiting" ? "대기 중" : room.state === "playing" ? "게임 중" : "경기 종료"}</td><td><code>{room.code}</code></td><td><button disabled={!signedIn || pending || room.players >= room.capacity} onClick={() => void act("join", room.code)}>{room.players >= room.capacity ? "가득 참" : "참여하기"}</button></td></tr>)}</tbody></table></div>}
    {signedIn && <form className={styles.row} action={data => act("join", String(data.get("code")))}><label>방 코드로 참여<input name="code" required maxLength={9} placeholder="8자리 방 코드" autoComplete="off" /></label><button disabled={pending}>방 참여하기</button></form>}
  </section>;
}
