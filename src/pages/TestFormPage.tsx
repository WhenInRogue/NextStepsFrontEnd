import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import { extractTest, type Test, type TestPayload } from "@/types/test";

const TestFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [original, setOriginal] = useState<Test | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await ApiService.getTestById(id);
        const test = extractTest(res);
        if (!test) {
          throw new Error("Test Not Found");
        }
        setOriginal(test);
        setName(test.name);
        setDescription(test.description ?? "");
      } catch (err) {
        toast({
          title: "Test not found",
          description: ApiService.getErrorMessage(err, "Failed to load test"),
          variant: "destructive",
        });
        navigate("/tests", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate, toast]);

  const buildUpdatePayload = (): TestPayload | null => {
    if (!original) return null;
    const payload: TestPayload = {};
    const nextName = name.trim();
    const nextDescription = description.trim();
    const prevDescription = (original.description ?? "").trim();

    if (nextName !== original.name) payload.name = nextName;
    if (nextDescription !== prevDescription) payload.description = nextDescription;

    return Object.keys(payload).length > 0 ? payload : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Test Name is required");
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
        const payload: TestPayload = { name: trimmedName };
        const trimmedDescription = description.trim();
        if (trimmedDescription) payload.description = trimmedDescription;
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
