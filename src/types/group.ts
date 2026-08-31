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
    groupId: Number(value.groupId),
    name: String(value.name ?? ""),
    description: typeof value.description === "string" ? value.description : undefined,
    isActive: typeof isActive === "boolean" ? isActive : true,
  };
}
