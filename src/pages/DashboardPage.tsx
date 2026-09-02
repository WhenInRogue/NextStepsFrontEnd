import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import {
  extractUser,
  extractUsers,
  formatUserRole,
  isUserRole,
  sortUsers,
  userLabel,
  USER_ROLES,
  type User,
  type UserRole,
} from "@/types/user";

const selectTriggerClass = "h-10 w-[200px] rounded-xl bg-sand text-ink";

const DashboardPage = () => {
  const { toast } = useToast();
  const isAdmin = ApiService.isAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

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
        setUsers(sortUsers(extractUsers(usersRes)));
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
    if (!needle) return users;
    return users.filter((user) => {
      const role = formatUserRole(user.role).toLowerCase();
      return userLabel(user).toLowerCase().includes(needle) || role.includes(needle);
    });
  }, [users, query]);

  const handleRoleChange = async (user: User, role: UserRole) => {
    const current = isUserRole(user.role) ? user.role : "MEMBER";
    if (role === current) return;
    setPendingId(user.id);
    try {
      const res = await ApiService.updateUser(user.id, { role });
      setUsers((prev) => sortUsers(prev.map((item) => (item.id === user.id ? { ...item, role } : item))));
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
            <CoastalScene className="absolute inset-0 h-full w-full" />
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

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 1 ? "1 person" : `${filtered.length} people`}
            {query.trim() && filtered.length !== users.length ? ` of ${users.length}` : ""}
          </p>
          <div className="w-full sm:max-w-xs">
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
              Nothing matches “{query.trim()}”. Try another name or email.
            </p>
          </section>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((user) => {
              const isSelf = currentUserId != null && user.id === currentUserId;
              const roleValue = isUserRole(user.role) ? user.role : "MEMBER";
              const canEditRole = isAdmin && !isSelf;
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
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
