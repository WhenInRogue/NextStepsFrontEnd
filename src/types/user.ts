import { normalizeDateTime } from "@/types/test";

export const USER_ROLES = ["MEMBER", "DREAM_TEAM_LEADER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number] | string;
export type UserSort = "recent" | "oldest";

export type User = {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  emailVerified?: boolean;
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
    emailVerified:
      typeof nested.emailVerified === "boolean"
        ? nested.emailVerified
        : typeof value.emailVerified === "boolean"
          ? value.emailVerified
          : undefined,
    createdAt: normalizeDateTime(
      nested.createdAt ?? nested.created_at ?? value.createdAt ?? value.created_at,
    ),
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
  return [...users].sort(compareUsersByName);
}

export function sortUsersByCreatedAt(users: User[], direction: UserSort): User[] {
  const newestFirst = direction === "recent";
  return [...users].sort((a, b) => {
    const aTime = createdAtTime(a.createdAt);
    const bTime = createdAtTime(b.createdAt);
    const aOk = aTime != null;
    const bOk = bTime != null;
    if (aOk && bOk && aTime !== bTime) return newestFirst ? bTime - aTime : aTime - bTime;
    if (aOk !== bOk) return aOk ? -1 : 1;
    return compareUsersByName(a, b);
  });
}

export function formatUserCreatedAt(createdAt?: string): string | undefined {
  if (!createdAt) return undefined;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toLocalDateKey(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function userMatchesJoinedRange(user: Pick<User, "createdAt">, from?: string, to?: string): boolean {
  const start = from?.trim() ?? "";
  const end = to?.trim() ?? "";
  if (!start && !end) return true;
  const key = toLocalDateKey(user.createdAt);
  if (!key) return false;
  const lo = start && end && start > end ? end : start;
  const hi = start && end && start > end ? start : end;
  if (lo && key < lo) return false;
  if (hi && key > hi) return false;
  return true;
}

function compareUsersByName(a: User, b: User): number {
  return a.name.localeCompare(b.name) || (a.email || "").localeCompare(b.email || "") || a.id - b.id;
}

function createdAtTime(createdAt?: string): number | null {
  if (!createdAt) return null;
  const time = new Date(createdAt).getTime();
  return Number.isFinite(time) ? time : null;
}
