import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
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
import { extractTest, formatTestCreatedAt, type Test } from "@/types/test";
import CategoriesSection from "@/components/tests/CategoriesSection";

const TestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/tests", { replace: true });
      return;
    }

    const load = async () => {
      try {
        const res = await ApiService.getTestById(id);
        const loaded = extractTest(res);
        if (!loaded) {
          throw new Error("Test Not Found");
        }
        setTest(loaded);
      } catch (err) {
        toast({
          title: "Test not found",
          description: ApiService.getErrorMessage(err, "Test Not Found"),
          variant: "destructive",
        });
        navigate("/tests", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!id || !test) return;
    setDeleting(true);
    try {
      const res = await ApiService.deleteTest(id);
      toast({ title: "Test deleted", description: res.message || `${test.name} has been removed.` });
      navigate("/tests", { replace: true });
    } catch (err) {
      toast({
        title: "Couldn’t delete test",
        description: ApiService.getErrorMessage(err, "Failed to delete test"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !test) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  const created = formatTestCreatedAt(test.createdAt);
  const fields = [
    { label: "Name", value: test.name },
    { label: "Description", value: test.description || "—" },
    { label: "Created", value: created || "—" },
  ];

  return (
    <Layout>
      <div className="animate-rise">
        <p className="mb-4">
          <Link to="/tests" className="text-sm text-muted-foreground transition-colors hover:text-ink">
            ← Tests
          </Link>
        </p>

        <section className="relative overflow-hidden rounded-2xl">
          <div className="relative h-56 md:h-72">
            <CoastalScene className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              <span className="inline-block rounded-full bg-sand/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                Assessment
              </span>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-cream drop-shadow-sm md:text-5xl">
                {test.name}
              </h1>
              {test.description ? (
                <p className="mt-2 max-w-2xl font-serif italic text-cream/85">{test.description}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-ink">Test details</h2>
              <p className="mt-1 text-sm text-muted-foreground">The particulars we keep for this assessment.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to={`/tests/${test.id}/edit`}>Edit</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif">Delete {test.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes the test, all of its questions, and every result anyone has submitted.
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDelete}
                    >
                      Delete test
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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

        <CategoriesSection />
      </div>
    </Layout>
  );
};

export default TestDetailPage;
