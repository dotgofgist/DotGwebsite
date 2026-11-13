import type { Metadata } from "next";
import { PlayerAuthPage } from "@/features/game-social/auth-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "로그인", robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <PlayerAuthPage mode="login" next={(await searchParams).next} />;
}
