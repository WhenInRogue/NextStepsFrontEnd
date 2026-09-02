import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import CategoryScoresSection from "@/components/tests/CategoryScoresSection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import { extractCategoryScores, type CategoryScore } from "@/types/category-score";
import {
  extractTestResult,
  extractTestResults,
  formatCompletedAt,
  isTestResultComplete,
  latestCompletedResultForTest,
  resultTestId,
  type TestResult,
} from "@/types/test-result";
import { extractUser } from "@/types/user";

type ResultLocationState = {
  testResult?: TestResult;
  categoryScores?: CategoryScore[];
};

const TestResultPage = () => {
  const { testResultId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const passed = (location.state ?? null) as ResultLocationState | null;

  const [testResult, setTestResult] = useState<TestResult | null>(passed?.testResult ?? null);
  const [scores, setScores] = useState<CategoryScore[]>(passed?.categoryScores ?? []);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(!passed?.testResult);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!testResultId) {
      navigate("/profile", { replace: true });
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      let redirected = false;
      try {
        const resultRes = await ApiService.getTestResultById(testResultId);
        if (cancelled) return;

        const loaded = extractTestResult(resultRes);
        if (!loaded) throw new Error("Test Result Not Found");

        if (!isTestResultComplete(loaded)) {
          redirected = true;
          const testId = resultTestId(loaded);
          navigate(testId ? `/take/${testId}` : "/profile", { replace: true });
          return;
        }

        const testId = resultTestId(loaded);
        const ownerId = loaded.user?.id;
        if (testId != null && ownerId != null) {
          try {
            const listRes = await ApiService.getTestResultsByUser(ownerId);
            if (cancelled) return;
            const latest = latestCompletedResultForTest(extractTestResults(listRes), testId);
            if (latest && latest.testResultId !== loaded.testResultId) {
              redirected = true;
              navigate(`/results/${latest.testResultId}`, { replace: true });
              return;
            }
          } catch {
            // Keep this attempt if the latest-result lookup fails.
          }
        }

        setTestResult(loaded);

        try {
          const meRes = await ApiService.getLoggedInUserInfo();
          if (!cancelled) setCurrentUserId(extractUser(meRes).id);
        } catch {
          if (!cancelled) setCurrentUserId(null);
        }

        try {
          const scoreRes = await ApiService.getScoresByTestResult(testResultId);
          if (cancelled) return;
          const fromEndpoint = extractCategoryScores(scoreRes);
          setScores(fromEndpoint.length > 0 ? fromEndpoint : loaded.categoryScores ?? []);
        } catch {
          if (!cancelled) setScores(loaded.categoryScores ?? []);
        }
      } catch (err) {
        if (cancelled) return;
        const status = ApiService.getErrorStatus(err);
        const message = ApiService.getErrorMessage(
          err,
          status === 403 ? "You can only view your own test results" : "Test Result Not Found",
        );
        setError(message);
        toast({
          title: status === 403 ? "Access denied" : "Results not found",
          description: message,
          variant: "destructive",
        });
        if (status === 403 || status === 404) {
          redirected = true;
          navigate("/profile", { replace: true });
        }
      } finally {
        if (!cancelled && !redirected) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [testResultId, navigate, toast]);

  if (loading && !testResult) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  if (error && !testResult) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl animate-rise">
          <p className="mb-4">
            <Link to="/profile" className="text-sm text-muted-foreground transition-colors hover:text-ink">
              ← Profile
            </Link>
          </p>
          <p className="error-banner">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!testResult) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  const testName = testResult.test?.name || "Assessment";
  const completed = formatCompletedAt(testResult.completedAt);
  const testId = resultTestId(testResult);
  const isOwn = currentUserId != null && testResult.user?.id === currentUserId;
  const backTo =
    currentUserId != null && !isOwn && testResult.user?.id
      ? `/users/${testResult.user.id}/assessments`
      : "/profile";
  const backLabel =
    currentUserId != null && !isOwn && testResult.user?.name
      ? `${testResult.user.name}'s assessments`
      : "Profile";
  const heading =
    currentUserId == null
      ? "Results"
      : isOwn
        ? "Your results"
        : testResult.user?.name
          ? `${testResult.user.name}'s results`
          : "Results";

  return (
    <Layout>
      <div className="animate-rise">
        <p className="mb-4">
          <Link to={backTo} className="text-sm text-muted-foreground transition-colors hover:text-ink">
            ← {backLabel}
          </Link>
        </p>

        <section className="relative overflow-hidden rounded-2xl">
          <div className="relative h-44 md:h-56">
            <CoastalScene className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              <span className="inline-block rounded-full bg-sand/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                Results
              </span>
              <h1 className="mt-3 font-serif text-3xl font-semibold text-cream drop-shadow-sm md:text-4xl">{testName}</h1>
              {completed ? <p className="mt-2 font-serif italic text-cream/85">Completed {completed}</p> : null}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-serif text-2xl font-semibold text-ink">{heading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scores are the share of points earned in each spiritual gift and church team.
          </p>
          <CategoryScoresSection scores={scores} />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to={backTo}>{isOwn ? "Back to profile" : "Back"}</Link>
            </Button>
            {isOwn && testId ? (
              <Button asChild>
                <Link to={`/take/${testId}`}>Take again</Link>
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TestResultPage;
