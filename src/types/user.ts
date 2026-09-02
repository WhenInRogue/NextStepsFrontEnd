export type UserRole = "ADMIN" | "DREAM_TEAM_LEADER" | "MEMBER" | string;

export type User = {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  createdAt?: string;
};

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
    role: typeof nested.role === "string" ? nested.role : typeof value.role === "string" ? value.role : undefined,
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
