import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import { isGroupActive, type Group } from "@/types/group";
import {
  extractMembership,
  extractMemberships,
  formatGroupPosition,
  isMembershipActive,
  membershipDisplayName,
  membershipUserId,
  mergeMembership,
  sortMemberships,
  type GroupMembership,
  type GroupPosition,
} from "@/types/membership";
import { extractUser, extractUsers, userLabel, type User } from "@/types/user";
import { cn } from "@/lib/utils";

const selectTriggerClass =
  "h-12 rounded-xl border-input bg-sand px-4 text-base text-ink md:text-sm";

const GroupMembersSection = ({ group }: { group: Group }) => {
  const { toast } = useToast();
  const isAdmin = ApiService.isAdmin();
  const isDreamTeamLeader = ApiService.isDreamTeamLeader();
  const groupIsActive = isGroupActive(group);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<GroupMembership[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersError, setUsersError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [manualUserId, setManualUserId] = useState("");
  const [addPosition, setAddPosition] = useState<GroupPosition>("MEMBER");
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const loadMembers = async () => {
    const res = await ApiService.getMembersByGroup(group.groupId);
    setMembers(sortMemberships(extractMemberships(res)));
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [memberRes, meRes] = await Promise.all([
          ApiService.getMembersByGroup(group.groupId),
          ApiService.getLoggedInUserInfo(),
        ]);
        if (cancelled) return;
        setMembers(sortMemberships(extractMemberships(memberRes)));
        setCurrentUser(extractUser(meRes));
      } catch (err) {
        if (cancelled) return;
        const status = ApiService.getErrorStatus(err);
        setError(
          ApiService.getErrorMessage(
            err,
            status === 403 ? "You do not have access to this group's members" : "Failed to load members",
          ),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [group.groupId]);

  useEffect(() => {
    if (!addOpen) return;
    let cancelled = false;
    const loadUsers = async () => {
      setUsersError("");
      try {
        const res = await ApiService.getAllUsers();
        if (!cancelled) setUsers(extractUsers(res));
      } catch (err) {
        if (!cancelled) {
          setUsers([]);
          setUsersError(ApiService.getErrorMessage(err, "Couldn’t load the people list. You can still enter a user id."));
        }
      }
    };
    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [addOpen]);

  const canManage = useMemo(() => {
    if (isAdmin) return true;
    if (!isDreamTeamLeader || !currentUser) return false;
    return members.some(
      (membership) =>
        isMembershipActive(membership) &&
        membership.position === "LEADER" &&
        membershipUserId(membership) === currentUser.id,
    );
  }, [isAdmin, isDreamTeamLeader, currentUser, members]);

  const activeMemberIds = useMemo(() => {
    const ids = new Set<number>();
    members.forEach((membership) => {
      if (!isMembershipActive(membership)) return;
      const id = membershipUserId(membership);
      if (id != null) ids.add(id);
    });
    return ids;
  }, [members]);

  const addableUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (activeMemberIds.has(user.id)) return false;
      if (!needle) return true;
      return userLabel(user).toLowerCase().includes(needle);
    });
  }, [users, activeMemberIds, query]);

  const applyMembership = (next: GroupMembership | null) => {
    if (!next) {
      loadMembers().catch(() => undefined);
      return;
    }
    setMembers((prev) => {
      const exists = prev.some((item) => item.groupMembershipId === next.groupMembershipId);
      const merged = exists
        ? prev.map((item) => (item.groupMembershipId === next.groupMembershipId ? mergeMembership(item, next) : item))
        : [...prev, next];
      return sortMemberships(merged);
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = Number(selectedUserId || manualUserId);
    if (!Number.isFinite(userId) || userId <= 0) {
      toast({ title: "Choose a person", description: "A user is required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await ApiService.addMember(group.groupId, { userId, position: addPosition });
      applyMembership(extractMembership(res));
      toast({ title: "Member added", description: res.message || "Member added successfully" });
      setAddOpen(false);
      setQuery("");
      setSelectedUserId("");
      setManualUserId("");
      setAddPosition("MEMBER");
    } catch (err) {
      toast({
        title: "Couldn’t add member",
        description: ApiService.getErrorMessage(err, "Failed to add member"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePositionChange = async (membership: GroupMembership, position: GroupPosition) => {
    if (position === membership.position) return;
    setPendingId(membership.groupMembershipId);
    try {
      const res = await ApiService.updateMembership(membership.groupMembershipId, { position });
      applyMembership(extractMembership(res));
      toast({ title: "Membership updated", description: res.message || "Position saved" });
    } catch (err) {
      toast({
        title: "Couldn’t update member",
        description: ApiService.getErrorMessage(err, "Failed to update membership"),
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleRestore = async (membership: GroupMembership) => {
    setPendingId(membership.groupMembershipId);
    try {
      const res = await ApiService.updateMembership(membership.groupMembershipId, { isActive: true });
      applyMembership(extractMembership(res));
      toast({ title: "Member restored", description: res.message || "Membership updated successfully" });
    } catch (err) {
      toast({
        title: "Couldn’t restore member",
        description: ApiService.getErrorMessage(err, "Failed to restore membership"),
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (membership: GroupMembership) => {
    setPendingId(membership.groupMembershipId);
    try {
      const res = await ApiService.removeMember(membership.groupMembershipId);
      setMembers((prev) => {
        if (!isAdmin) {
          return prev.filter((item) => item.groupMembershipId !== membership.groupMembershipId);
        }
        return sortMemberships(
          prev.map((item) =>
            item.groupMembershipId === membership.groupMembershipId ? { ...item, isActive: false } : item,
          ),
        );
      });
      toast({ title: "Member removed", description: res.message || "Member removed successfully" });
    } catch (err) {
      toast({
        title: "Couldn’t remove member",
        description: ApiService.getErrorMessage(err, "Failed to remove member"),
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const activeCount = members.filter(isMembershipActive).length;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Members</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading this team’s people…" : `${activeCount} active ${activeCount === 1 ? "member" : "members"}`}
          </p>
        </div>
        {canManage ? (
          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open);
              if (!open) {
                setQuery("");
                setSelectedUserId("");
                setManualUserId("");
                setAddPosition("MEMBER");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={!groupIsActive} title={!groupIsActive ? "Cannot add members to an inactive group" : undefined}>
                Add member
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Add a member</DialogTitle>
                <DialogDescription>Choose someone to join {group.name}. If they were removed before, this restores them.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                {users.length > 0 ? (
                  <>
                    <div>
                      <label htmlFor="member-search" className="field-label">
                        Search
                      </label>
                      <Input
                        id="member-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Name or email"
                      />
                    </div>
                    <div>
                      <label className="field-label">Person</label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue placeholder={addableUsers.length ? "Select a person" : "No one left to add"} />
                        </SelectTrigger>
                        <SelectContent>
                          {addableUsers.map((user) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              {userLabel(user)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="member-user-id" className="field-label">
                      User id
                    </label>
                    <Input
                      id="member-user-id"
                      inputMode="numeric"
                      value={manualUserId}
                      onChange={(e) => setManualUserId(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                    {usersError ? <p className="mt-2 text-sm text-muted-foreground">{usersError}</p> : null}
                  </div>
                )}
                <div>
                  <label className="field-label">Position</label>
                  <Select value={addPosition} onValueChange={(value) => setAddPosition(value as GroupPosition)}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="LEADER">Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                    {saving ? "Adding..." : "Add to group"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {!groupIsActive && canManage ? (
        <p className="error-banner mb-6">This group is inactive, so new members can’t be added.</p>
      ) : null}

      {error ? <p className="error-banner">{error}</p> : null}

      {loading ? (
        <p className="py-8 text-center font-serif text-lg text-ink/60">Loading…</p>
      ) : !error && members.length === 0 ? (
        <p className="rounded-xl bg-sand/70 px-4 py-8 text-center text-sm text-muted-foreground">
          {canManage ? "No members yet. Add the first person to this team." : "No members to show."}
        </p>
      ) : (
        <ul className="space-y-3">
          {members.map((membership) => {
            const active = isMembershipActive(membership);
            const isSelf = currentUser != null && membershipUserId(membership) === currentUser.id;
            const removingSelfLeader = isSelf && membership.position === "LEADER";
            const busy = pendingId === membership.groupMembershipId;
            return (
              <li
                key={membership.groupMembershipId}
                className={cn("rounded-xl bg-sand/70 px-4 py-4", !active && "opacity-75")}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{membershipDisplayName(membership)}</p>
                      {!active ? (
                        <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink/60">
                          Inactive
                        </span>
                      ) : null}
                      {isSelf ? (
                        <span className="rounded-full bg-ochre/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
                          You
                        </span>
                      ) : null}
                    </div>
                    {membership.user?.email ? (
                      <p className="mt-1 text-sm text-muted-foreground">{membership.user.email}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canManage && active ? (
                      <Select
                        value={membership.position}
                        onValueChange={(value) => handlePositionChange(membership, value as GroupPosition)}
                        disabled={busy}
                      >
                        <SelectTrigger className="h-10 w-[140px] rounded-xl bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="LEADER">Leader</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="rounded-full bg-azure/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-azure">
                        {formatGroupPosition(membership.position)}
                      </span>
                    )}

                    {canManage && !active ? (
                      <Button variant="outline" size="sm" disabled={busy} onClick={() => handleRestore(membership)}>
                        Restore
                      </Button>
                    ) : null}

                    {canManage && active ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={busy}>
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-serif">
                              Remove {membershipDisplayName(membership)}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              They will no longer appear as a member of {group.name}. You can add them back later.
                              {removingSelfLeader
                                ? " You are a leader of this group — removing yourself will take away permission to manage members."
                                : null}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleRemove(membership)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default GroupMembersSection;
