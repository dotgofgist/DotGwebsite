"use client";
import { useEffect, useRef, useState } from "react";
import type { PlayerProfile } from "./types";
import { PlayerAvatar } from "./avatar-image";
import { avatarFileError } from "./avatar";
import styles from "./portal.module.css";

export function ProfileSettings({ profile, pending, save, changePhoto }: {
  profile: PlayerProfile | null; pending: boolean;
  save: (values: Record<string, string>) => Promise<boolean>;
  changePhoto: (file: File | null) => Promise<boolean>;
}) {
  const [values, setValues] = useState({ handle: profile?.handle ?? "", real_name: profile?.real_name ?? "", display_name: profile?.display_name ?? "", bio: profile?.bio ?? "", avatar: profile?.avatar ?? "coral" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function selectPhoto(next?: File) {
    setError("");
    if (!next) { setFile(null); setPreview(""); return; }
    const issue = avatarFileError(next);
    if (issue) { setError(issue); setFile(null); setPreview(""); if (fileInput.current) fileInput.current.value = ""; return; }
    setFile(next); setPreview(URL.createObjectURL(next));
  }
  async function submitPhoto(remove: boolean) {
    if (await changePhoto(remove ? null : file)) {
      setFile(null); setPreview("");
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  return <section className={styles.card} id="profile">
    <h2>{profile ? "내 프로필" : "첫 프로필 만들기"}</h2>
    <div className={styles.profilePreview}><PlayerAvatar name={values.display_name} color={values.avatar} path={profile?.avatar_path} preview={preview} large /><div><strong>{values.display_name || "나만의 닉네임"}</strong><small className={styles.muted}>{values.handle ? `@${values.handle}` : "사용자 ID로 친구를 찾을 수 있어요."}</small></div></div>
    {profile ? <form className={styles.photoForm} onSubmit={event => { event.preventDefault(); if (file) void submitPhoto(false); }}>
      <label>프로필 사진<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={event => selectPhoto(event.target.files?.[0])} /><small className={styles.muted}>JPG·PNG·WebP, 2MB 이하 · 친구에게 표시됩니다.</small></label>
      <div className={styles.actions}><button disabled={pending || !file}>{pending ? "처리 중…" : "사진 저장"}</button>{file && <button type="button" className={styles.secondary} disabled={pending} onClick={() => { selectPhoto(); if (fileInput.current) fileInput.current.value = ""; }}>선택 취소</button>}{profile.avatar_path && <button type="button" className={styles.secondary} disabled={pending} onClick={() => void submitPhoto(true)}>기본 사진으로 변경</button>}</div>
      {error && <p role="alert">{error}</p>}
    </form> : <p className={styles.muted}>프로필을 먼저 저장하면 사진을 변경할 수 있어요.</p>}
    <form className={styles.form} aria-busy={pending} onSubmit={event => { event.preventDefault(); void save(values); }}>
      <label>이름<input name="real_name" autoComplete="name" value={values.real_name} onChange={event => setValues({ ...values, real_name: event.target.value })} required maxLength={50} /><small className={styles.muted}>본인만 볼 수 있는 이름입니다. 친구와 게임에는 닉네임이 표시됩니다.</small></label>
      <label>닉네임<input name="display_name" autoComplete="nickname" value={values.display_name} onChange={event => setValues({ ...values, display_name: event.target.value })} required maxLength={32} placeholder="게임에서 사용할 닉네임" /></label>
      <label>사용자 ID<input name="handle" value={values.handle} onChange={event => setValues({ ...values, handle: event.target.value.toLowerCase() })} required pattern="[a-z0-9_]{3,24}" minLength={3} maxLength={24} autoCapitalize="none" spellCheck={false} placeholder="dotg_player" /><small className={styles.muted}>영문 소문자·숫자·밑줄, 3~24자 · 친구 검색에 사용합니다.</small></label>
      <label>소개<textarea name="bio" value={values.bio} onChange={event => setValues({ ...values, bio: event.target.value })} maxLength={240} placeholder="좋아하는 게임이나 짧은 인사" /></label>
      <label>기본 프로필 색상<select name="avatar" value={values.avatar} onChange={event => setValues({ ...values, avatar: event.target.value })}><option value="coral">코랄</option><option value="mint">민트</option><option value="blue">블루</option><option value="violet">바이올렛</option></select></label>
      <button disabled={pending}>{pending ? "저장 중…" : "프로필 저장"}</button>
    </form>
  </section>;
}
