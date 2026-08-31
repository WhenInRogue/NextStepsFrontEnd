import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import GroupStatusBadge from "@/components/groups/GroupStatusBadge";
import { Button } from "@/components/ui/button";
import ApiService from "@/services/ApiService";
import { isGroupActive, normalizeGroup, type Group } from "@/types/group";
import { cn } from "@/lib/utils";

const GroupsPage = () => {
  const isAdmin = ApiService.isAdmin();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ApiService.getAllGroups();
        const list = Array.isArray(res.groups) ? res.groups.map(normalizeGroup) : [];
        setGroups(list);
      } catch (err) {
        setError(ApiService.getErrorMessage(err, "Failed to load groups"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
                {isAdmin ? "All teams" : "Your teams"}
              </span>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-cream drop-shadow-sm md:text-5xl">Groups</h1>
              <p className="mt-2 max-w-xl text-sm text-cream/85">
                {isAdmin
                  ? "Create and tend the church teams members can serve on."
                  : "The teams you belong to — your place to serve."}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {groups.length === 1 ? "1 team" : `${groups.length} teams`}
          </p>
          {isAdmin ? (
            <Button asChild>
              <Link to="/groups/new">New group</Link>
            </Button>
          ) : null}
        </div>

        {error ? <p className="error-banner mt-6">{error}</p> : null}

        {groups.length === 0 && !error ? (
          <section className="mt-6 rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              {isAdmin ? "No groups yet" : "You aren’t on any teams yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {isAdmin
                ? "Start with a name and a short description. Members only see teams they belong to."
                : "When a leader adds you to a team, it will show up here."}
            </p>
            {isAdmin ? (
              <Button asChild className="mt-6">
                <Link to="/groups/new">Create a group</Link>
              </Button>
            ) : null}
          </section>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {groups.map((group) => {
              const active = isGroupActive(group);
              return (
                <li key={group.groupId}>
                  <Link
                    to={`/groups/${group.groupId}`}
                    className={cn(
                      "block rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-sand/60",
                      !active && "opacity-80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-serif text-2xl font-semibold text-ink">{group.name}</h2>
                      {isAdmin ? <GroupStatusBadge group={group} /> : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {group.description || "No description yet."}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default GroupsPage;
