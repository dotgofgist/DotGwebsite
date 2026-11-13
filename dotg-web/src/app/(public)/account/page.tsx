import type { Metadata } from "next";
import { PlayerAccountPage } from "@/features/game-social/account-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "프로필 설정", robots: { index: false, follow: false } };
export default function AccountPage() { return <PlayerAccountPage view="profile" />; }
