import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import {
  extractTestResults,
  formatCompletedAt,
  latestCompletedResultsByTest,
  type TestResult,
} from "@/types/test-result";
import { extractUser, type User } from "@/types/user";

const UserAssessmentsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/dashboard", { replace: true });
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const me = extractUser(await ApiService.getLoggedInUserInfo());
        if (cancelled) return;
        if (me.id === Number(userId)) {
          navigate("/profile", { replace: true });
          return;
        }

        try {
          const userRes = await ApiService.getUserById(userId);
          if (!cancelled) setUser(extractUser(userRes));
        } catch {
          if (!cancelled) setUser({ id: Number(userId), name: "Member" });
        }

        const resultRes = await ApiService.getTestResultsByUser(userId);
        if (cancelled) return;
        setResults(latestCompletedResultsByTest(extractTestResults(resultRes)));
      } catch (err) {
        if (cancelled) return;
        const status = ApiService.getErrorStatus(err);
        const message = ApiService.getErrorMessage(
          err,
          status === 403 ? "You can only view your own test results" : "Failed to load assessments",
        );
        setError(message);
        toast({
          title: status === 403 ? "Access denied" : "Couldn’t load assessments",
          description: message,
          variant: "destructive",
        });
        if (status === 403 || status === 404) {
          navigate("/dashboard", { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, navigate, toast]);

  if (loading) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  const name = user?.name || "Member";

  return (
    <Layout>
      <div className="animate-rise">
        <p className="mb-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-ink">
            ← Dashboard
          </Link>
        </p>

        <section className="relative overflow-hidden rounded-2xl">
          <div className="relative h-44 md:h-56">
            <CoastalScene className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              <span className="inline-block rounded-full bg-sand/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                Assessments
              </span>
              <h1 className="mt-3 font-serif text-3xl font-semibold text-cream drop-shadow-sm md:text-4xl">{name}</h1>
              {user?.email ? <p className="mt-2 font-serif italic text-cream/85">{user.email}</p> : null}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-semibold text-ink">Latest results</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The most recent completed attempt for each assessment.
            </p>
          </div>

          {error ? <p className="error-banner">{error}</p> : null}

          {!error && results.length === 0 ? (
            <p className="rounded-xl bg-sand/70 px-4 py-8 text-center text-sm text-muted-foreground">
              {name} has not submitted an assessment yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {results.map((result) => {
                const completed = formatCompletedAt(result.completedAt);
                const testName = result.test?.name || "Assessment";
                return (
                  <li key={result.testResultId} className="rounded-xl bg-sand/70 px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{testName}</p>
                        {completed ? <p className="mt-1 text-sm text-muted-foreground">Completed {completed}</p> : null}
                      </div>
                      <Button asChild className="shrink-0">
                        <Link to={`/results/${result.testResultId}`}>View results</Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default UserAssessmentsPage;
