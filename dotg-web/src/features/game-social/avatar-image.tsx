"use client";
import Image from "next/image";
import { useState } from "react";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { PLAYER_AVATAR_BUCKET } from "./avatar";
import styles from "./portal.module.css";

export function PlayerAvatar({ name, color, path, large = false, preview }: {
  name: string; color: string; path?: string | null; large?: boolean; preview?: string;
}) {
  const [failed, setFailed] = useState("");
  const env = getSupabasePublicEnv();
  const source = preview || (path && env ? `${env.url}/storage/v1/object/public/${PLAYER_AVATAR_BUCKET}/${path}` : "");
  return <span className={`${styles.avatar} ${large ? styles.avatarLarge : ""}`} data-color={color}>
    {source && failed !== source
      ? <Image src={source} alt={`${name || "내"} 프로필 사진`} width={large ? 96 : 42} height={large ? 96 : 42} unoptimized onError={() => setFailed(source)} />
      : <span aria-label={`${name || "내"} 기본 프로필`}>{[...(name || "D")][0]}</span>}
  </span>;
}
