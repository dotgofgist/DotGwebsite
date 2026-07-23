import type { LoginActionState } from "./types";

export type LoginCredentials = {
  email: string;
  password: string;
  next: string;
};

const emailMaxLength = 254;
const passwordMaxLength = 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

export function validateLoginForm(formData: FormData):
  | { ok: true; credentials: LoginCredentials }
  | { ok: false; state: LoginActionState } {
  const email = readFormString(formData, "email").trim();
  const password = readFormString(formData, "password");
  const next = readFormString(formData, "next");
  const fieldErrors: NonNullable<LoginActionState["fieldErrors"]> = {};

  if (!email) {
    fieldErrors.email = "이메일을 입력해 주세요.";
  } else if (email.length > emailMaxLength || !emailPattern.test(email)) {
    fieldErrors.email = "올바른 이메일 형식을 입력해 주세요.";
  }

  if (!password) {
    fieldErrors.password = "비밀번호를 입력해 주세요.";
  } else if (password.length > passwordMaxLength) {
    fieldErrors.password = "비밀번호가 너무 깁니다.";
  }

  if (fieldErrors.email || fieldErrors.password) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "입력한 내용을 확인해 주세요.",
        fieldErrors,
      },
    };
  }

  return {
    ok: true,
    credentials: {
      email,
      password,
      next,
    },
  };
}
