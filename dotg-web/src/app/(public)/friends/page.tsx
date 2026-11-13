import type { Metadata } from "next";
import { PlayerAccountPage } from "@/features/game-social/account-page";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "친구", robots: { index: false, follow: false } };
export default function FriendsPage() { return <PlayerAccountPage view="friends" />; }
