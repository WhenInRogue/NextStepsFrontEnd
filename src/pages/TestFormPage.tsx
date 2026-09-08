import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import GroupStatusBadge from "@/components/groups/GroupStatusBadge";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import { extractGroups, isGroupActive, sortGroups, type Group } from "@/types/group";
import {
  assignedGroupIds,
  extractTest,
  isTestActive,
  isTestAudience,
  sameIdList,
  type Test,
  type TestAudience,
  type TestPayload,
} from "@/types/test";

const TestFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [original, setOriginal] = useState<Test | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [audience, setAudience] = useState<TestAudience>("EVERYONE");
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const groupsRes = await ApiService.getAllGroups();
        if (!cancelled) setGroups(sortGroups(extractGroups(groupsRes)));
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Couldn’t load groups",
            description: ApiService.getErrorMessage(err, "Failed to load groups"),
            variant: "destructive",
          });
        }
      }

      if (!id) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await ApiService.getTestById(id);
        const test = extractTest(res);
        if (!test) {
          throw new Error("Test Not Found");
        }
        if (cancelled) return;
        setOriginal(test);
        setName(test.name);
        setDescription(test.description ?? "");
        setIsActive(isTestActive(test));
        setAudience(test.audience);
        setSelectedGroupIds(assignedGroupIds(test));
      } catch (err) {
        if (cancelled) return;
        toast({
          title: "Test not found",
          description: ApiService.getErrorMessage(err, "Failed to load test"),
          variant: "destructive",
        });
        navigate("/tests", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, toast]);

  const toggleGroup = (groupId: number, checked: boolean) => {
    setSelectedGroupIds((prev) => {
      if (checked) return prev.includes(groupId) ? prev : [...prev, groupId];
      return prev.filter((item) => item !== groupId);
    });
  };

  const buildUpdatePayload = (): TestPayload | null => {
    if (!original) return null;
    const payload: TestPayload = {};
    const nextName = name.trim();
    const nextDescription = description.trim();
    const prevDescription = (original.description ?? "").trim();

    if (nextName !== original.name) payload.name = nextName;
    if (nextDescription !== prevDescription) payload.description = nextDescription;
    if (isActive !== isTestActive(original)) payload.isActive = isActive;
    if (audience !== original.audience) payload.audience = audience;
    if (audience === "GROUPS" && !sameIdList(selectedGroupIds, assignedGroupIds(original))) {
      payload.groupIds = selectedGroupIds;
    }

    return Object.keys(payload).length > 0 ? payload : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Test Name is required");
      return;
    }
    if (audience === "GROUPS" && selectedGroupIds.length === 0) {
      setError("Select at least one group, or make this test available to everyone.");
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
        const res = await ApiService.updateTest(id, payload);
        toast({ title: "Test updated", description: res.message || "Test Updated Successfully" });
        navigate(`/tests/${id}`);
      } else {
        const payload: TestPayload = { name: trimmedName, isActive, audience };
        const trimmedDescription = description.trim();
        if (trimmedDescription) payload.description = trimmedDescription;
        if (audience === "GROUPS") payload.groupIds = selectedGroupIds;
        const res = await ApiService.createTest(payload);
        toast({ title: "Test created", description: res.message || "Test Created Successfully" });
        navigate("/tests");
      }
    } catch (err) {
      setError(ApiService.getErrorMessage(err, isEdit ? "Failed to update test" : "Failed to create test"));
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

  const backTo = isEdit && id ? `/tests/${id}` : "/tests";

  return (
    <Layout>
      <div className="mx-auto max-w-xl animate-rise">
        <p className="mb-4">
          <Link to={backTo} className="text-sm text-muted-foreground transition-colors hover:text-ink">
            ← {isEdit ? "Test" : "Tests"}
          </Link>
        </p>

        <div className="relative mb-8 h-44 overflow-hidden rounded-2xl">
          <CoastalScene className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cream/80">
              {isEdit ? "Update assessment" : "New assessment"}
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-cream">
              {isEdit ? "Edit test" : "Create a test"}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div>
            <label htmlFor="test-name" className="field-label">
              Name
            </label>
            <Input id="test-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="test-description" className="field-label">
              Description
            </label>
            <Textarea
              id="test-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="min-h-[120px] rounded-xl border-input bg-sand px-4 py-3 text-base text-ink md:text-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-sand/70 px-4 py-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Active</p>
              <p className="mt-1 text-sm text-ink/70">Inactive tests are hidden from members.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Test is active" />
          </div>

          <fieldset>
            <legend className="field-label">Audience</legend>
            <RadioGroup
              value={audience}
              onValueChange={(value) => {
                if (isTestAudience(value)) setAudience(value);
              }}
              className="grid gap-2 sm:grid-cols-2"
            >
              <label
                htmlFor="audience-everyone"
                className="flex cursor-pointer items-start gap-3 rounded-xl bg-sand/70 px-4 py-4"
              >
                <RadioGroupItem value="EVERYONE" id="audience-everyone" className="mt-1" />
                <span>
                  <span className="block font-medium text-ink">Everyone</span>
                  <span className="mt-1 block text-sm text-ink/70">Any member can take this test.</span>
                </span>
              </label>
              <label
                htmlFor="audience-groups"
                className="flex cursor-pointer items-start gap-3 rounded-xl bg-sand/70 px-4 py-4"
              >
                <RadioGroupItem value="GROUPS" id="audience-groups" className="mt-1" />
                <span>
                  <span className="block font-medium text-ink">Groups</span>
                  <span className="mt-1 block text-sm text-ink/70">Only members of selected teams.</span>
                </span>
              </label>
            </RadioGroup>
          </fieldset>

          {audience === "GROUPS" ? (
            <div>
              <p className="field-label">Assigned groups</p>
              {groups.length === 0 ? (
                <p className="rounded-xl bg-sand/70 px-4 py-4 text-sm text-muted-foreground">
                  No groups yet. Create a team first, then assign this test.
                </p>
              ) : (
                <ul className="max-h-56 space-y-1 overflow-y-auto rounded-xl bg-sand/70 p-2">
                  {groups.map((group) => {
                    const checked = selectedGroupIds.includes(group.groupId);
                    return (
                      <li key={group.groupId}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-sand">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => toggleGroup(group.groupId, value === true)}
                            aria-label={`Assign ${group.name}`}
                          />
                          <span className="min-w-0 flex-1 font-medium text-ink">{group.name}</span>
                          {!isGroupActive(group) ? <GroupStatusBadge group={group} /> : null}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}

          {error ? <p className="error-banner">{error}</p> : null}

          <Button type="submit" className="h-12 w-full text-lg" disabled={saving}>
            {saving ? (isEdit ? "Saving..." : "Creating test...") : isEdit ? "Save changes" : "Create test"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default TestFormPage;
