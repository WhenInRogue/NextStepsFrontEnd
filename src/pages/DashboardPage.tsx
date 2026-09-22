import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import BrandHero from "@/components/brand/BrandHero";
import PaginationComponent from "@/components/common/PaginationComponent";
import TypeToDeleteDialog from "@/components/common/TypeToDeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import {
  extractUser,
  extractUsers,
  formatUserCreatedAt,
  formatUserRole,
  isUserRole,
  sortUsersByCreatedAt,
  userLabel,
  userMatchesJoinedRange,
  USER_ROLES,
  type User,
  type UserRole,
  type UserSort,
} from "@/types/user";

const PAGE_SIZE = 25;
const selectTriggerClass = "h-10 w-[200px] rounded-xl bg-sand text-ink";
const filterSelectClass = "h-12 w-full rounded-xl bg-sand text-ink";

const DashboardPage = () => {
  const { toast } = useToast();
  const isAdmin = ApiService.isAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<UserSort>("recent");
  const [joinedFrom, setJoinedFrom] = useState("");
  const [joinedTo, setJoinedTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const resultsRef = useRef<HTMLParagraphElement>(null);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [usersRes, meRes] = await Promise.all([
          ApiService.getAllUsers(),
          ApiService.getLoggedInUserInfo(),
        ]);
        if (cancelled) return;
        setUsers(extractUsers(usersRes));
        setCurrentUserId(extractUser(meRes).id);
      } catch (err) {
        if (!cancelled) setError(ApiService.getErrorMessage(err, "Failed to load people"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = users.filter((user) => {
      if (!userMatchesJoinedRange(user, joinedFrom, joinedTo)) return false;
      if (!needle) return true;
      const role = formatUserRole(user.role).toLowerCase();
      return userLabel(user).toLowerCase().includes(needle) || role.includes(needle);
    });
    return sortUsersByCreatedAt(matches, sort);
  }, [users, query, sort, joinedFrom, joinedTo]);

  useEffect(() => {
    setPage(1);
  }, [query, sort, joinedFrom, joinedTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pageStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = pageStart + pageItems.length;

  const hasSearch = Boolean(query.trim());
  const hasRange = Boolean(joinedFrom || joinedTo);
  const hasFilters = hasSearch || hasRange;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRoleChange = async (user: User, role: UserRole) => {
    const current = isUserRole(user.role) ? user.role : "MEMBER";
    if (role === current) return;
    setPendingId(user.id);
    try {
      const res = await ApiService.updateUser(user.id, { role });
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, role } : item)));
      toast({
        title: "Role updated",
        description: res.message || `${user.name || "User"} is now ${formatUserRole(role).toLowerCase()}.`,
      });
    } catch (err) {
      toast({
        title: "Couldn’t update role",
        description: ApiService.getErrorMessage(err, "Failed to update user"),
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const closeDeleteDialog = () => {
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (currentUserId != null && userToDelete.id === currentUserId) return;
    setPendingId(userToDelete.id);
    try {
      const res = await ApiService.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((item) => item.id !== userToDelete.id));
      toast({
        title: "Person deleted",
        description: res.message || `${userToDelete.name || "User"} was deleted.`,
      });
      closeDeleteDialog();
    } catch (err) {
      toast({
        title: "Couldn’t delete person",
        description: ApiService.getErrorMessage(err, "Failed to delete user"),
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-rise">
        <section className="relative overflow-hidden rounded-2xl">
          <div className="relative h-48 md:h-56">
            <BrandHero className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              <span className="inline-block rounded-full bg-sand/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                Leaders
              </span>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-cream drop-shadow-sm md:text-5xl">Dashboard</h1>
              <p className="mt-2 max-w-xl text-sm text-cream/85">
                {isAdmin
                  ? "View results, and promote people to dream team leader or admin."
                  : "Every member, and the latest gifts and team interests they have submitted."}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-4">
          <p ref={resultsRef} className="text-sm text-muted-foreground">
            {filtered.length === 1 ? "1 person" : `${filtered.length} people`}
            {hasFilters && filtered.length !== users.length ? ` of ${users.length}` : ""}
            {filtered.length > PAGE_SIZE ? ` · ${rangeStart}–${rangeEnd}` : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="dashboard-search" className="field-label">
                Search
              </label>
              <Input
                id="dashboard-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email, or role"
              />
            </div>
            <div>
              <label htmlFor="dashboard-sort" className="field-label">
                Sort
              </label>
              <Select value={sort} onValueChange={(value) => setSort(value as UserSort)}>
                <SelectTrigger id="dashboard-sort" className={filterSelectClass} aria-label="Sort people">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="dashboard-joined-from" className="field-label">
                Joined from
              </label>
              <Input
                id="dashboard-joined-from"
                type="date"
                value={joinedFrom}
                onChange={(e) => setJoinedFrom(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="dashboard-joined-to" className="field-label">
                Joined to
              </label>
              <Input
                id="dashboard-joined-to"
                type="date"
                value={joinedTo}
                onChange={(e) => setJoinedTo(e.target.value)}
              />
            </div>
          </div>
          {hasRange ? (
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setJoinedFrom("");
                  setJoinedTo("");
                }}
              >
                Clear dates
              </Button>
            </div>
          ) : null}
        </div>

        {error ? <p className="error-banner mt-6">{error}</p> : null}

        {!error && users.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-ink">No people yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              When accounts are registered, they will appear here.
            </p>
          </section>
        ) : !error && filtered.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-ink">No matches</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {hasSearch && hasRange
                ? "Nothing matches that search and date range."
                : hasRange
                  ? "No people joined in that date range."
                  : `Nothing matches “${query.trim()}”. Try another name or email.`}
            </p>
          </section>
        ) : (
          <>
            <ul className="mt-6 space-y-3">
              {pageItems.map((user) => {
                const isSelf = currentUserId != null && user.id === currentUserId;
                const roleValue = isUserRole(user.role) ? user.role : "MEMBER";
                const canEditRole = isAdmin && !isSelf;
                const joined = formatUserCreatedAt(user.createdAt);
                return (
                  <li key={user.id} className="rounded-2xl border border-border bg-card px-4 py-4 md:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-ink">{user.name || "Unnamed"}</p>
                          {isSelf ? (
                            <span className="rounded-full bg-ochre/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
                              You
                            </span>
                          ) : null}
                          {!canEditRole ? (
                            <span className="rounded-full bg-azure/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-azure">
                              {formatUserRole(user.role)}
                            </span>
                          ) : null}
                        </div>
                        {user.email ? <p className="mt-1 text-sm text-muted-foreground">{user.email}</p> : null}
                        {joined ? <p className="mt-1 text-sm text-muted-foreground">Joined {joined}</p> : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {canEditRole ? (
                          <Select
                            value={roleValue}
                            onValueChange={(value) => handleRoleChange(user, value)}
                            disabled={pendingId === user.id}
                          >
                            <SelectTrigger className={selectTriggerClass} aria-label={`Role for ${user.name || "user"}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {USER_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {formatUserRole(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : null}
                        <Button asChild>
                          <Link to={isSelf ? "/profile" : `/users/${user.id}/assessments`}>
                            {isSelf ? "Your profile" : "View results"}
                          </Link>
                        </Button>
                        {isAdmin && !isSelf ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={pendingId === user.id}
                            aria-label={`Delete ${user.name || "user"}`}
                            onClick={() => setUserToDelete(user)}
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {totalPages > 1 ? (
              <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            ) : null}
          </>
        )}

        <TypeToDeleteDialog
          open={userToDelete != null}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog();
          }}
          title={`Delete ${userToDelete?.name || "this person"}?`}
          description={`This permanently deletes${userToDelete?.email ? ` ${userToDelete.email}` : " this account"} and cannot be undone.`}
          pending={pendingId === userToDelete?.id}
          onConfirm={handleDeleteUser}
        />
      </div>
    </Layout>
  );
};

export default DashboardPage;
