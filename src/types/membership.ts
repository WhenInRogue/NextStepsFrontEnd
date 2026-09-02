import { normalizeGroup, type Group } from "@/types/group";
import { normalizeUser, type User } from "@/types/user";

export const GROUP_POSITIONS = ["MEMBER", "LEADER"] as const;
export type GroupPosition = (typeof GROUP_POSITIONS)[number];

export type GroupMembership = {
  groupMembershipId: number;
  position: GroupPosition;
  isActive?: boolean;
  group?: Group;
  user?: User;
  userId?: number;
};

export type MembershipPayload = {
  userId?: number;
  position?: GroupPosition;
  isActive?: boolean;
};

export function isMembershipActive(membership: Pick<GroupMembership, "isActive">): boolean {
  return membership.isActive !== false;
}

export function isGroupPosition(value: unknown): value is GroupPosition {
  return value === "MEMBER" || value === "LEADER";
}

export function formatGroupPosition(position?: GroupPosition): string {
  if (position === "LEADER") return "Leader";
  return "Member";
}

export function membershipUserId(membership: GroupMembership): number | undefined {
  const id = membership.userId ?? membership.user?.id;
  return Number.isFinite(id) ? Number(id) : undefined;
}

export function membershipDisplayName(membership: GroupMembership): string {
  return membership.user?.name || membership.user?.email || `User ${membershipUserId(membership) ?? membership.groupMembershipId}`;
}

export function normalizeMembership(raw: unknown): GroupMembership {
  const value = (raw ?? {}) as Record<string, unknown>;
  const isActive = value.isActive ?? value.active;
  const positionRaw = typeof value.position === "string" ? value.position.toUpperCase() : "MEMBER";
  const user = value.user ? normalizeUser(value.user) : undefined;
  const userId = value.userId ?? user?.id;

  return {
    groupMembershipId: Number(value.groupMembershipId ?? value.id),
    position: isGroupPosition(positionRaw) ? positionRaw : "MEMBER",
    isActive: typeof isActive === "boolean" ? isActive : true,
    group: value.group ? normalizeGroup(value.group) : undefined,
    user: user && Number.isFinite(user.id) ? user : undefined,
    userId: userId != null && Number.isFinite(Number(userId)) ? Number(userId) : undefined,
  };
}

export function extractMembership(res: unknown): GroupMembership | null {
  const value = (res ?? {}) as Record<string, unknown>;
  if (!value.groupMembership) return null;
  return normalizeMembership(value.groupMembership);
}

export function extractMemberships(res: unknown): GroupMembership[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.groupMemberships;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeMembership).filter((item) => Number.isFinite(item.groupMembershipId));
}

export function mergeMembership(previous: GroupMembership, next: GroupMembership): GroupMembership {
  return {
    ...previous,
    ...next,
    user: next.user ?? previous.user,
    group: next.group ?? previous.group,
    userId: next.userId ?? previous.userId ?? next.user?.id ?? previous.user?.id,
  };
}

export function sortMemberships(list: GroupMembership[]): GroupMembership[] {
  return [...list].sort((a, b) => {
    const activeRank = Number(isMembershipActive(b)) - Number(isMembershipActive(a));
    if (activeRank !== 0) return activeRank;
    const leadRank = Number(b.position === "LEADER") - Number(a.position === "LEADER");
    if (leadRank !== 0) return leadRank;
    return membershipDisplayName(a).localeCompare(membershipDisplayName(b));
  });
}
