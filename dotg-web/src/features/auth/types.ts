export type UserRole = "member" | "editor" | "admin";

export type ContentManagerRole = Extract<UserRole, "editor" | "admin">;

export type AuthenticatedIdentity = {
  id: string;
  email: string | null;
};

export type ContentManagerIdentity = AuthenticatedIdentity & {
  displayName: string | null;
  role: ContentManagerRole;
};

export type LoginActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

export function isContentManagerRole(
  role: UserRole | null | undefined,
): role is ContentManagerRole {
  return role === "editor" || role === "admin";
}
