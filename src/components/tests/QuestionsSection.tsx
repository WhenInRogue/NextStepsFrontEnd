import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import {
  extractCategories,
  formatCategoryType,
  groupCategoriesByType,
  type Category,
} from "@/types/category";
import {
  extractQuestion,
  extractQuestions,
  mergeQuestion,
  nextQuestionNumber,
  parseQuestionNumber,
  questionCategoryId,
  sortQuestions,
  type Question,
  type QuestionPayload,
} from "@/types/question";
import type { Test } from "@/types/test";

const selectTriggerClass = "h-12 rounded-xl border-input bg-sand px-4 text-base text-ink md:text-sm";
const textareaClass = "min-h-[96px] rounded-xl border-input bg-sand px-4 py-3 text-base text-ink md:text-sm";

const emptyForm = {
  questionNumber: "1",
  questionText: "",
  categoryId: "",
};

const QuestionsSection = ({ test }: { test: Test }) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const loadQuestions = async () => {
    const res = await ApiService.getQuestionsByTest(test.id);
    setQuestions(sortQuestions(extractQuestions(res)));
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [questionRes, categoryRes] = await Promise.all([
          ApiService.getQuestionsByTest(test.id),
          ApiService.getAllCategories(),
        ]);
        if (cancelled) return;
        setQuestions(sortQuestions(extractQuestions(questionRes)));
        setCategories(extractCategories(categoryRes));
      } catch (err) {
        if (cancelled) return;
        setError(ApiService.getErrorMessage(err, "Failed to load questions"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [test.id]);

  const refreshCategories = async () => {
    try {
      const res = await ApiService.getAllCategories();
      setCategories(extractCategories(res));
    } catch {
      /* picker can still use whatever we already have */
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      questionNumber: String(nextQuestionNumber(questions)),
      questionText: "",
      categoryId: "",
    });
    setFormError("");
    setFormOpen(true);
    void refreshCategories();
  };

  const openEdit = (question: Question) => {
    setEditing(question);
    setForm({
      questionNumber: String(question.questionNumber),
      questionText: question.questionText,
      categoryId: String(questionCategoryId(question) ?? ""),
    });
    setFormError("");
    setFormOpen(true);
  };

  const applyQuestion = (next: Question | null, fallbackCategory?: Category) => {
    if (!next) {
      loadQuestions().catch(() => undefined);
      return;
    }
    const withCategory =
      next.category || !fallbackCategory
        ? next
        : { ...next, category: fallbackCategory, categoryId: fallbackCategory.categoryId };
    setQuestions((prev) => {
      const exists = prev.some((item) => item.questionId === withCategory.questionId);
      const merged = exists
        ? prev.map((item) => (item.questionId === withCategory.questionId ? mergeQuestion(item, withCategory) : item))
        : [...prev, withCategory];
      return sortQuestions(merged);
    });
  };

  const buildUpdatePayload = (): QuestionPayload | null => {
    if (!editing) return null;
    const payload: QuestionPayload = {};
    const nextNumber = parseQuestionNumber(form.questionNumber);
    const nextText = form.questionText.trim();

    if (nextNumber != null && nextNumber !== editing.questionNumber) payload.questionNumber = nextNumber;
    if (nextText !== editing.questionText.trim()) payload.questionText = nextText;

    return Object.keys(payload).length > 0 ? payload : null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const questionNumber = parseQuestionNumber(form.questionNumber);
    if (questionNumber == null) {
      setFormError("Question number is required");
      return;
    }
    const questionText = form.questionText.trim();
    if (!questionText) {
      setFormError("Question text is required");
      return;
    }

    const taken = questions.some(
      (item) => item.questionNumber === questionNumber && item.questionId !== editing?.questionId,
    );
    if (taken) {
      setFormError("Question number already exists on this test");
      return;
    }

    const categoryId = Number(form.categoryId);
    if (!editing && (!Number.isFinite(categoryId) || categoryId <= 0)) {
      setFormError("An existing category is required to create a question");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editing) {
        const payload = buildUpdatePayload();
        if (!payload) {
          toast({ title: "No changes", description: "Nothing to update." });
          setSaving(false);
          return;
        }
        const res = await ApiService.updateQuestion(editing.questionId, payload);
        applyQuestion(extractQuestion(res), editing.category);
        toast({ title: "Question updated", description: res.message || "Question Updated Successfully" });
      } else {
        const selectedCategory = categories.find((item) => item.categoryId === categoryId);
        const res = await ApiService.createQuestion(test.id, {
          questionNumber,
          questionText,
          categoryId,
        });
        applyQuestion(extractQuestion(res), selectedCategory);
        toast({ title: "Question created", description: res.message || "Question Created Successfully" });
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(ApiService.getErrorMessage(err, editing ? "Failed to update question" : "Failed to create question"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (question: Question) => {
    setPendingId(question.questionId);
    try {
      const res = await ApiService.deleteQuestion(question.questionId);
      setQuestions((prev) => prev.filter((item) => item.questionId !== question.questionId));
      toast({ title: "Question deleted", description: res.message || "Question Deleted Successfully" });
    } catch (err) {
      toast({
        title: "Couldn’t delete question",
        description: ApiService.getErrorMessage(err, "Failed to delete question"),
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const groupedCategories = groupCategoriesByType(categories);
  const editingCategory = editing?.category;
  const canCreate = categories.length > 0;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Questions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Loading this assessment’s questions…"
              : `${questions.length === 1 ? "1 question" : `${questions.length} questions`} — each scores into a gift or team.`}
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={!canCreate} title={!canCreate ? "Add a category first" : undefined}>
          New question
        </Button>
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
            setForm(emptyForm);
            setFormError("");
          }
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{editing ? "Edit question" : "New question"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "You can change the number or wording. The category stays as it was when this question was created."
                : "Number, text, and a category are required. The category cannot be changed later."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="question-number" className="field-label">
                Number
              </label>
              <Input
                id="question-number"
                inputMode="numeric"
                value={form.questionNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, questionNumber: e.target.value.replace(/\D/g, "") }))}
                required
              />
            </div>
            <div>
              <label htmlFor="question-text" className="field-label">
                Question
              </label>
              <Textarea
                id="question-text"
                value={form.questionText}
                onChange={(e) => setForm((prev) => ({ ...prev, questionText: e.target.value }))}
                rows={4}
                className={textareaClass}
                required
              />
            </div>
            {editing ? (
              <div className="rounded-xl bg-sand/70 px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Category</p>
                <p className="mt-1 font-medium text-ink">
                  {editingCategory?.categoryName || "This category"}
                </p>
                {editingCategory ? (
                  <p className="mt-1 text-sm text-muted-foreground">{formatCategoryType(editingCategory.categoryType)}</p>
                ) : null}
              </div>
            ) : (
              <div>
                <label className="field-label">Category</label>
                <Select value={form.categoryId} onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select a gift or team" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupedCategories.map((group) =>
                      group.items.length === 0 ? null : (
                        <SelectGroup key={group.type}>
                          <SelectLabel>{group.label}</SelectLabel>
                          {group.items.map((category) => (
                            <SelectItem key={category.categoryId} value={String(category.categoryId)}>
                              {category.categoryName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formError ? <p className="error-banner">{formError}</p> : null}
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Create question"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {!canCreate && !loading && !error ? (
        <p className="error-banner mb-6">Add a gift or team category below before you write questions.</p>
      ) : null}

      {error ? <p className="error-banner">{error}</p> : null}

      {loading ? (
        <p className="py-8 text-center font-serif text-lg text-ink/60">Loading…</p>
      ) : error ? null : questions.length === 0 ? (
        <p className="rounded-xl bg-sand/70 px-4 py-8 text-center text-sm text-muted-foreground">
          No questions yet. Add the first one for {test.name}.
        </p>
      ) : (
        <ul className="space-y-3">
          {questions.map((question) => {
            const busy = pendingId === question.questionId;
            const category = question.category;
            return (
              <li key={question.questionId} className="rounded-xl bg-sand/70 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-azure/15 font-serif text-sm text-azure">
                      {question.questionNumber}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{question.questionText}</p>
                      {category ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-azure/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-azure">
                            {formatCategoryType(category.categoryType)}
                          </span>
                          <p className="text-sm text-muted-foreground">{category.categoryName}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(question)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={busy}>
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-serif">Delete question {question.questionNumber}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes the question and any answers already given for it. This cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(question)}
                          >
                            Delete question
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default QuestionsSection;
