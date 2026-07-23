import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createAdminLoginPath } from "./redirects";
import {
  isContentManagerRole,
  type AuthenticatedIdentity,
  type ContentManagerIdentity,
} from "./types";

export async function getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
  };
}

export async function getCurrentContentManager(): Promise<ContentManagerIdentity | null> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", identity.id)
    .maybeSingle();

  if (error) {
    throw new Error("관리자 프로필을 조회하지 못했습니다.");
  }

  if (!data || !isContentManagerRole(data.role)) {
    return null;
  }

  return {
    ...identity,
    displayName: data.display_name,
    role: data.role,
  };
}

export async function requireAuthenticatedIdentity(): Promise<AuthenticatedIdentity> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    redirect(createAdminLoginPath());
  }

  return identity;
}

export async function requireContentManager(): Promise<ContentManagerIdentity> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    redirect(createAdminLoginPath());
  }

  try {
    const manager = await getCurrentContentManager();

    if (manager) {
      return manager;
    }
  } catch {
    redirect("/admin/unauthorized?reason=profile-unavailable");
  }

  redirect("/admin/unauthorized");
}
