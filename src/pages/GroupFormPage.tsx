import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import { isGroupActive, normalizeGroup, type Group, type GroupPayload } from "@/types/group";

const GroupFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [original, setOriginal] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await ApiService.getGroupById(id);
        const group = normalizeGroup(res.group);
        setOriginal(group);
        setName(group.name);
        setDescription(group.description ?? "");
        setIsActive(isGroupActive(group));
      } catch (err) {
        const status = ApiService.getErrorStatus(err);
        toast({
          title: status === 403 ? "Access denied" : "Group not found",
          description: ApiService.getErrorMessage(err, "Failed to load group"),
          variant: "destructive",
        });
        navigate("/groups", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate, toast]);

  const buildUpdatePayload = (): GroupPayload | null => {
    if (!original) return null;
    const payload: GroupPayload = {};
    const nextName = name.trim();
    const nextDescription = description.trim();
    const prevDescription = (original.description ?? "").trim();

    if (nextName !== original.name) payload.name = nextName;
    if (nextDescription !== prevDescription) payload.description = nextDescription;
    if (isActive !== isGroupActive(original)) payload.isActive = isActive;

    return Object.keys(payload).length > 0 ? payload : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Group name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isEdit && id) {
        const payload = buildUpdatePayload();
        if (!payload) {
          toast({ title: "No changes", description: "Nothing to update." });
          setSaving(false);
          return;
        }
        const res = await ApiService.updateGroup(id, payload);
        const updated = res.group ? normalizeGroup(res.group) : { groupId: Number(id) };
        toast({ title: "Group updated", description: res.message || "Group Updated Successfully" });
        navigate(`/groups/${updated.groupId}`);
      } else {
        const payload: GroupPayload = { name: trimmedName, isActive };
        const trimmedDescription = description.trim();
        if (trimmedDescription) payload.description = trimmedDescription;
        const res = await ApiService.createGroup(payload);
        const created = res.group ? normalizeGroup(res.group) : null;
        toast({ title: "Group created", description: res.message || "Group Created Successfully" });
        navigate(created?.groupId ? `/groups/${created.groupId}` : "/groups");
      }
    } catch (err) {
      setError(ApiService.getErrorMessage(err, isEdit ? "Failed to update group" : "Failed to create group"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  const backTo = isEdit && id ? `/groups/${id}` : "/groups";

  return (
    <Layout>
      <div className="mx-auto max-w-xl animate-rise">
        <p className="mb-4">
          <Link to={backTo} className="text-sm text-muted-foreground transition-colors hover:text-ink">
            ← {isEdit ? "Group" : "Groups"}
          </Link>
        </p>

        <div className="relative mb-8 h-44 overflow-hidden rounded-2xl">
          <CoastalScene className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cream/80">
              {isEdit ? "Update team" : "New team"}
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-cream">
              {isEdit ? "Edit group" : "Create a group"}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div>
            <label htmlFor="group-name" className="field-label">
              Name
            </label>
            <Input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="group-description" className="field-label">
              Description
            </label>
            <Textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="min-h-[120px] rounded-xl border-input bg-sand px-4 py-3 text-base text-ink md:text-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-sand/70 px-4 py-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Active</p>
              <p className="mt-1 text-sm text-ink/70">Inactive groups are hidden from members.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Group is active" />
          </div>

          {error ? <p className="error-banner">{error}</p> : null}

          <Button type="submit" className="h-12 w-full text-lg" disabled={saving}>
            {saving ? (isEdit ? "Saving..." : "Creating group...") : isEdit ? "Save changes" : "Create group"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default GroupFormPage;
