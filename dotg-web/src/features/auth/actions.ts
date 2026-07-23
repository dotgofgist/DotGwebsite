"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSafeAdminReturnPath } from "./redirects";
import { isContentManagerRole, type LoginActionState } from "./types";
import { validateLoginForm } from "./validation";

const authMismatchMessage = "이메일 또는 비밀번호를 확인해 주세요.";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Supabase 인증 환경이 설정되지 않았습니다.",
    };
  }

  const validation = validateLoginForm(formData);

  if (!validation.ok) {
    return validation.state;
  }

  const { email, password, next } = validation.credentials;
  const redirectPath = getSafeAdminReturnPath(next);
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: authMismatchMessage,
    };
  }

  const user = await supabase.auth.getUser();

  if (user.error || !user.data.user) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      status: "error",
      message: "로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  const profile = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.data.user.id)
    .maybeSingle();

  if (profile.error) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      status: "error",
      message: "관리자 프로필 설정을 확인해 주세요.",
    };
  }

  if (!profile.data || !isContentManagerRole(profile.data.role)) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      status: "error",
      message: "이 계정에는 관리자 페이지 접근 권한이 없습니다.",
    };
  }

  redirect(redirectPath);
}

export async function logoutAction(): Promise<never> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut({ scope: "local" });
  }

  redirect("/admin/login");
}
