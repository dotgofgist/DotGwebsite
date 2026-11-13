import type { Metadata } from "next";
import { PlayerAuthPage } from "@/features/game-social/auth-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "회원가입", robots: { index: false, follow: false } };
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <PlayerAuthPage mode="signup" next={(await searchParams).next} />;
}
