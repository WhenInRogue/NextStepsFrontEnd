import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ApiService from "@/services/ApiService";
import { extractTests, type Test } from "@/types/test";
import {
  extractTestResults,
  formatCompletedAt,
  hasCompletedTest,
  incompleteResultForTest,
  latestCompletedResultForTest,
  type TestResult,
} from "@/types/test-result";

const AssessmentsSection = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [testRes, resultRes] = await Promise.all([
          ApiService.getAllTests(),
          ApiService.getCurrentUserTestResults(),
        ]);
        if (cancelled) return;
        setTests(extractTests(testRes));
        setResults(extractTestResults(resultRes));
      } catch (err) {
        if (!cancelled) setError(ApiService.getErrorMessage(err, "Failed to load assessments"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">Assessments</h2>
        <p className="mt-1 text-sm text-muted-foreground">Take a test to see your spiritual gifts and team interests.</p>
      </div>

      {error ? <p className="error-banner">{error}</p> : null}

      {loading ? (
        <p className="py-8 text-center font-serif text-lg text-ink/60">Loading…</p>
      ) : error ? null : tests.length === 0 ? (
        <p className="rounded-xl bg-sand/70 px-4 py-8 text-center text-sm text-muted-foreground">
          No assessments are available yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {tests.map((test) => {
            const incomplete = incompleteResultForTest(results, test.id);
            const completed = latestCompletedResultForTest(results, test.id);
            const hasCompleted = hasCompletedTest(results, test.id);
            const actionLabel = incomplete ? "Continue" : hasCompleted ? "Take again" : "Take test";
            const completedLabel = formatCompletedAt(completed?.completedAt);
            return (
              <li key={test.id} className="rounded-xl bg-sand/70 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{test.name}</p>
                      {incomplete ? (
                        <span className="rounded-full bg-ochre/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
                          In progress
                        </span>
                      ) : hasCompleted ? (
                        <span className="rounded-full bg-azure/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-azure">
                          Completed
                        </span>
                      ) : null}
                    </div>
                    {test.description ? <p className="mt-1 text-sm text-muted-foreground">{test.description}</p> : null}
                    {completedLabel ? (
                      <p className="mt-1 text-sm text-muted-foreground">Last completed {completedLabel}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {completed ? (
                      <Button asChild variant="outline">
                        <Link to={`/results/${completed.testResultId}`}>View results</Link>
                      </Button>
                    ) : null}
                    <Button asChild>
                      <Link to={`/take/${test.id}`}>{actionLabel}</Link>
                    </Button>
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

export default AssessmentsSection;
