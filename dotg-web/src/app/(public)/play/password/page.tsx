import { redirect } from "next/navigation";
import { getAuthenticatedIdentity } from "@/features/auth/server";
import { PlayerAuthForm } from "@/features/game-social/auth-form";
import styles from "@/features/game-social/portal.module.css";
export const dynamic = "force-dynamic";
export default async function PasswordPage() {
  if (!await getAuthenticatedIdentity()) redirect("/play?auth_error=1");
  return <div className={styles.portal}><PlayerAuthForm passwordOnly /></div>;
}
