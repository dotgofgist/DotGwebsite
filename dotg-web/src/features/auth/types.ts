export type UserRole = "member" | "editor" | "admin";

export type ContentManagerRole = Extract<UserRole, "editor" | "admin">;
export type AdminRole = Extract<UserRole, "admin">;

export type AuthenticatedIdentity = {
  id: string;
  email: string | null;
};

export type ContentManagerIdentity = AuthenticatedIdentity & {
  displayName: string | null;
  role: ContentManagerRole;
};

export type ProfileIdentity = AuthenticatedIdentity & {
  displayName: string | null;
  role: UserRole;
};

export type AdminIdentity = AuthenticatedIdentity & {
  displayName: string | null;
  role: AdminRole;
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

export function isAdminRole(
  role: UserRole | null | undefined,
): role is AdminRole {
  return role === "admin";
}
