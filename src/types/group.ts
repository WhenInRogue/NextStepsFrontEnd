export type Group = {
  groupId: number;
  name: string;
  description?: string;
  isActive?: boolean;
};

export type GroupPayload = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

export function isGroupActive(group: Pick<Group, "isActive">): boolean {
  return group.isActive !== false;
}

export function normalizeGroup(raw: unknown): Group {
  const value = (raw ?? {}) as Record<string, unknown>;
  const isActive = value.isActive ?? value.active;
  return {
    groupId: Number(value.groupId ?? value.id),
    name: String(value.name ?? ""),
    description: typeof value.description === "string" ? value.description : undefined,
    isActive: typeof isActive === "boolean" ? isActive : true,
  };
}

export function extractGroups(res: unknown): Group[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.groups;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeGroup).filter((group) => Number.isFinite(group.groupId));
}

export function sortGroups(groups: Group[]): Group[] {
  return [...groups].sort(
    (a, b) =>
      Number(isGroupActive(b)) - Number(isGroupActive(a)) || a.name.localeCompare(b.name) || a.groupId - b.groupId,
  );
}
