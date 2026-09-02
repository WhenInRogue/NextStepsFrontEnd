export const USER_ROLES = ["MEMBER", "DREAM_TEAM_LEADER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number] | string;

export type User = {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  createdAt?: string;
};

export type UserPayload = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
};

export function isUserRole(value: unknown): value is (typeof USER_ROLES)[number] {
  return value === "MEMBER" || value === "DREAM_TEAM_LEADER" || value === "ADMIN";
}

export function normalizeUser(raw: unknown): User {
  const value = (raw ?? {}) as Record<string, unknown>;
  const nested =
    value.user && typeof value.user === "object" && !Array.isArray(value.user)
      ? (value.user as Record<string, unknown>)
      : value;
  const id = nested.id ?? nested.userId ?? value.id ?? value.userId;
  return {
    id: Number(id),
    name: String(nested.name ?? value.name ?? ""),
    email: typeof nested.email === "string" ? nested.email : typeof value.email === "string" ? value.email : undefined,
    phoneNumber:
      typeof nested.phoneNumber === "string"
        ? nested.phoneNumber
        : typeof value.phoneNumber === "string"
          ? value.phoneNumber
          : undefined,
    role: typeof nested.role === "string" ? nested.role.toUpperCase() : typeof value.role === "string" ? value.role.toUpperCase() : undefined,
    createdAt:
      typeof nested.createdAt === "string"
        ? nested.createdAt
        : typeof value.createdAt === "string"
          ? value.createdAt
          : undefined,
  };
}

export function extractUser(res: unknown): User {
  const value = (res ?? {}) as Record<string, unknown>;
  if (value.user && typeof value.user === "object" && !Array.isArray(value.user)) {
    return normalizeUser(value.user);
  }
  return normalizeUser(value);
}

export function extractUsers(res: unknown): User[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.users ?? value.userList;
  if (Array.isArray(list)) return list.map(normalizeUser).filter((user) => Number.isFinite(user.id));
  if (Array.isArray(res)) return (res as unknown[]).map(normalizeUser).filter((user) => Number.isFinite(user.id));
  return [];
}

export function userLabel(user: Pick<User, "name" | "email">): string {
  if (user.name && user.email) return `${user.name} (${user.email})`;
  return user.name || user.email || "Unknown member";
}

export function formatUserRole(role?: string): string {
  if (role === "ADMIN") return "Admin";
  if (role === "DREAM_TEAM_LEADER") return "Dream team leader";
  if (role === "MEMBER") return "Member";
  return role || "Member";
}

export function sortUsers(users: User[]): User[] {
  return [...users].sort(
    (a, b) => a.name.localeCompare(b.name) || (a.email || "").localeCompare(b.email || "") || a.id - b.id,
  );
}
