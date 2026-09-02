import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CoastalScene from "@/components/brand/CoastalScene";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";
import { answersByQuestionId, extractAnswers, isResponseValue, RESPONSE_OPTIONS } from "@/types/answer";
import { sortQuestions, type Question } from "@/types/question";
import { extractSubmittedResult, extractTakeSession, isTestResultComplete, type TestResult } from "@/types/test-result";

const TakeTestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/profile", { replace: true });
      return;
    }

    let cancelled = false;
    const start = async () => {
      setLoading(true);
      setError("");
      let redirected = false;
      try {
        const takeRes = await ApiService.takeTest(id);
        const session = extractTakeSession(takeRes);
        if (!session) throw new Error("Could not start this test");
        if (session.questions.length === 0) {
          throw new Error("This test has no questions yet");
        }

        let nextResponses: Record<number, number> = {};
        try {
          const answerRes = await ApiService.getAnswersByTestResult(session.testResult.testResultId);
          nextResponses = answersByQuestionId(extractAnswers(answerRes));
        } catch {
          nextResponses = {};
        }

        if (cancelled) return;
        if (isTestResultComplete(session.testResult)) {
          redirected = true;
          navigate(`/results/${session.testResult.testResultId}`, { replace: true });
          return;
        }
        setTestResult(session.testResult);
        setQuestions(sortQuestions(session.questions));
        setResponses(nextResponses);
        setSaved(nextResponses);
        setIndex(0);
      } catch (err) {
        if (cancelled) return;
        setError(ApiService.getErrorMessage(err, "Couldn’t start this test"));
      } finally {
        if (!cancelled && !redirected) setLoading(false);
      }
    };

    start();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const question = questions[index];
  const answeredCount = questions.filter((item) => isResponseValue(responses[item.questionId])).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const allSaved =
    allAnswered && questions.every((item) => saved[item.questionId] === responses[item.questionId]);
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const testName = testResult?.test?.name || question?.test?.name || "Assessment";

  const handleRespond = async (questionId: number, responseValue: number) => {
    if (!testResult) return;
    if (saved[questionId] === responseValue) {
      setResponses((prev) => ({ ...prev, [questionId]: responseValue }));
      return;
    }
    setResponses((prev) => ({ ...prev, [questionId]: responseValue }));
    setSavingId(questionId);
    try {
      await ApiService.saveAnswer(testResult.testResultId, { questionId, responseValue });
      setSaved((prev) => ({ ...prev, [questionId]: responseValue }));
    } catch (err) {
      toast({
        title: "Couldn’t save answer",
        description: ApiService.getErrorMessage(err, "Failed to save answer"),
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!testResult || !allSaved) return;
    setSubmitting(true);
    try {
      const res = await ApiService.submitTest(testResult.testResultId);
      const submittedResult = extractSubmittedResult(res);
      const resultId = submittedResult?.testResult.testResultId ?? testResult.testResultId;
      toast({ title: "Test submitted", description: res.message || "Test submitted successfully" });
      navigate(`/results/${resultId}`, {
        replace: true,
        state: submittedResult
          ? { testResult: { ...submittedResult.testResult, complete: true }, categoryScores: submittedResult.categoryScores }
          : undefined,
      });
    } catch (err) {
      toast({
        title: "Couldn’t submit test",
        description: ApiService.getErrorMessage(err, "Failed to submit test"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="py-24 text-center font-serif text-xl text-ink/60">Loading…</p>
      </Layout>
    );
  }

  if (error || !testResult || !question) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl animate-rise">
          <p className="mb-4">
            <Link to="/profile" className="text-sm text-muted-foreground transition-colors hover:text-ink">
              ← Profile
            </Link>
          </p>
          <p className="error-banner">{error || "This test has no questions yet"}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-rise">
        <p className="mb-4">
          <Link to="/profile" className="text-sm text-muted-foreground transition-colors hover:text-ink">
            ← Profile
          </Link>
        </p>

        <section className="relative overflow-hidden rounded-2xl">
          <div className="relative h-44 md:h-56">
            <CoastalScene className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              <span className="inline-block rounded-full bg-sand/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                Assessment
              </span>
              <h1 className="mt-3 font-serif text-3xl font-semibold text-cream drop-shadow-sm md:text-4xl">{testName}</h1>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Question {index + 1} of {questions.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {answeredCount} answered
                {savingId != null ? " · Saving…" : ". Your answers are saved as you go."}
              </p>
            </div>
            <p className="text-sm font-medium text-ink">{progress}%</p>
          </div>
          <Progress value={progress} className="mb-8 h-2 bg-sand" />

          {questions.length > 1 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {questions.map((item, questionIndex) => (
                <button
                  key={item.questionId}
                  type="button"
                  onClick={() => setIndex(questionIndex)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm",
                    questionIndex === index
                      ? "bg-ink text-cream"
                      : isResponseValue(responses[item.questionId])
                        ? "bg-azure/15 text-azure"
                        : "bg-sand text-ink/70",
                  )}
                  aria-label={`Question ${item.questionNumber}`}
                >
                  {item.questionNumber}
                </button>
              ))}
            </div>
          ) : null}

          <h2 className="font-serif text-2xl font-semibold text-ink">{question.questionText}</h2>

          <fieldset className="mt-6">
            <legend className="field-label">How true is this of you?</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {RESPONSE_OPTIONS.map((option) => {
                const selected = responses[question.questionId] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRespond(question.questionId, option.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-center transition-colors",
                      selected
                        ? "border-ink bg-ink text-cream"
                        : "border-border bg-sand/70 text-ink hover:bg-sand",
                    )}
                  >
                    <span className="block font-serif text-xl">{option.value}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] opacity-80">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={index === 0}
              onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
            >
              Previous
            </Button>
            <div className="flex flex-wrap gap-3">
              {index < questions.length - 1 ? (
                <Button type="button" onClick={() => setIndex((prev) => Math.min(questions.length - 1, prev + 1))}>
                  Next
                </Button>
              ) : null}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={!allSaved || submitting}>
                    {submitting ? "Submitting..." : "Submit test"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif">Submit {testName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      We’ll score your gifts and team interests. You can take this test again later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit} disabled={!allSaved}>
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TakeTestPage;
