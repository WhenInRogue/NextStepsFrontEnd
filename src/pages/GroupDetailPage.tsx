import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import GroupStatusBadge from "@/components/groups/GroupStatusBadge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import { normalizeGroup, type Group } from "@/types/group";
import GroupMembersSection from "@/components/groups/GroupMembersSection";

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = ApiService.isAdmin();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/groups", { replace: true });
      return;
    }

    const load = async () => {
      try {
        const res = await ApiService.getGroupById(id);
        setGroup(normalizeGroup(res.group));
      } catch (err) {
        const status = ApiService.getErrorStatus(err);
        const description = ApiService.getErrorMessage(
          err,
          status === 403 ? "You do not have access to this group" : "Group not found",
        );
        toast({
          title: status === 403 ? "Access denied" : "Group not found",
          description,
          variant: "destructive",
        });
        navigate("/groups", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!id || !group) return;
    setDeleting(true);
    try {
      const res = await ApiService.deleteGroup(id);
      toast({ title: "Group deleted", description: res.message || `${group.name} has been removed.` });
      navigate("/groups", { replace: true });
    } catch (err) {
      toast({
        title: "Couldn’t delete group",
        description: ApiService.getErrorMessage(err, "Failed to delete group"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !group) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  const fields = [
    { label: "Name", value: group.name },
    { label: "Description", value: group.description || "—" },
    { label: "Status", value: group.isActive === false ? "Inactive" : "Active" },
  ];

  return (
    <Layout>
      <div className="animate-rise">
        <p className="mb-4">
          <Link to="/groups" className="text-sm text-muted-foreground transition-colors hover:text-ink">
            ← Groups
          </Link>
        </p>

        <section className="relative overflow-hidden rounded-2xl">
          <div className="relative h-56 md:h-72">
            <CoastalScene className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              {isAdmin ? <GroupStatusBadge group={group} className="bg-sand/90 text-ink" /> : (
                <span className="inline-block rounded-full bg-sand/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                  Team
                </span>
              )}
              <h1 className="mt-3 font-serif text-4xl font-semibold text-cream drop-shadow-sm md:text-5xl">
                {group.name}
              </h1>
              {group.description ? (
                <p className="mt-2 max-w-2xl font-serif italic text-cream/85">{group.description}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">Group details</h2>
              <p className="mt-1 text-sm text-muted-foreground">The particulars we keep for this team.</p>
            </div>
            {isAdmin ? (
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to={`/groups/${group.groupId}/edit`}>Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif">Delete {group.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes the group and removes everyone from the team. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDelete}
                      >
                        Delete group
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : null}
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((item) => (
              <div key={item.label} className="rounded-xl bg-sand/70 px-4 py-4">
                <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 font-medium text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {ApiService.canViewGroupRoster() ? <GroupMembersSection group={group} /> : null}
      </div>
    </Layout>
  );
};

export default GroupDetailPage;
