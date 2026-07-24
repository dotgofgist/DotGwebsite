import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createAdminLoginPath } from "./redirects";
import {
  isAdminRole,
  isContentManagerRole,
  type AdminIdentity,
  type AuthenticatedIdentity,
  type ContentManagerIdentity,
  type ProfileIdentity,
} from "./types";

export const getAuthenticatedIdentity = cache(
  async function getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null> {
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
  },
);

export const getCurrentProfile = cache(
  async function getCurrentProfile(): Promise<ProfileIdentity | null> {
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
      throw new Error("Unable to load the current user profile.");
    }

    if (!data) {
      return null;
    }

    return {
      ...identity,
      displayName: data.display_name,
      role: data.role,
    };
  },
);

export async function getCurrentContentManager(): Promise<ContentManagerIdentity | null> {
  const profile = await getCurrentProfile();

  if (!profile || !isContentManagerRole(profile.role)) {
    return null;
  }

  return {
    ...profile,
    role: profile.role,
  };
}

export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  const profile = await getCurrentProfile();

  if (!profile || !isAdminRole(profile.role)) {
    return null;
  }

  return {
    ...profile,
    role: profile.role,
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

export async function requireAdmin(): Promise<AdminIdentity> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    redirect(createAdminLoginPath());
  }

  try {
    const admin = await getCurrentAdmin();

    if (admin) {
      return admin;
    }
  } catch {
    redirect("/admin/unauthorized?reason=profile-unavailable");
  }

  redirect("/admin/unauthorized?reason=admin-required");
}
