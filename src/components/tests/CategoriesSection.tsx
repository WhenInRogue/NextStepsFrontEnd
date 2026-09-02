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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/ApiService";
import {
  extractCategories,
  extractCategory,
  formatCategoryType,
  groupCategoriesByType,
  type Category,
  type CategoryPayload,
  type CategoryType,
} from "@/types/category";

const selectTriggerClass = "h-12 rounded-xl border-input bg-sand px-4 text-base text-ink md:text-sm";
const textareaClass = "min-h-[96px] rounded-xl border-input bg-sand px-4 py-3 text-base text-ink md:text-sm";

const emptyForm = {
  categoryName: "",
  description: "",
  categoryType: "GIFT" as CategoryType,
};

const CategoriesSection = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const load = async () => {
    const res = await ApiService.getAllCategories();
    setCategories(extractCategories(res));
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ApiService.getAllCategories();
        if (!cancelled) setCategories(extractCategories(res));
      } catch (err) {
        if (!cancelled) setError(ApiService.getErrorMessage(err, "Failed to load categories"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      categoryName: category.categoryName,
      description: category.description ?? "",
      categoryType: category.categoryType,
    });
    setFormError("");
    setFormOpen(true);
  };

  const buildUpdatePayload = (): CategoryPayload | null => {
    if (!editing) return null;
    const payload: CategoryPayload = {};
    const nextName = form.categoryName.trim();
    const nextDescription = form.description.trim();
    const prevDescription = (editing.description ?? "").trim();

    if (nextName !== editing.categoryName) payload.categoryName = nextName;
    if (nextDescription !== prevDescription) payload.description = nextDescription;
    if (form.categoryType !== editing.categoryType) payload.categoryType = form.categoryType;

    return Object.keys(payload).length > 0 ? payload : null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = form.categoryName.trim();
    if (!trimmedName) {
      setFormError("Category name is required");
      return;
    }
    if (!form.categoryType) {
      setFormError("Category type is required");
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
        const res = await ApiService.updateCategory(editing.categoryId, payload);
        const updated = extractCategory(res);
        if (updated) {
          setCategories((prev) =>
            prev.map((item) => (item.categoryId === updated.categoryId ? updated : item)),
          );
        } else {
          await load();
        }
        toast({ title: "Category updated", description: res.message || "Category Updated Successfully" });
      } else {
        const payload: CategoryPayload = {
          categoryName: trimmedName,
          categoryType: form.categoryType,
        };
        const trimmedDescription = form.description.trim();
        if (trimmedDescription) payload.description = trimmedDescription;
        const res = await ApiService.createCategory(payload);
        const created = extractCategory(res);
        if (created) {
          setCategories((prev) => [...prev, created]);
        } else {
          await load();
        }
        toast({ title: "Category created", description: res.message || "Category Created Successfully" });
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(ApiService.getErrorMessage(err, editing ? "Failed to update category" : "Failed to create category"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    setPendingId(category.categoryId);
    try {
      const res = await ApiService.deleteCategory(category.categoryId);
      setCategories((prev) => prev.filter((item) => item.categoryId !== category.categoryId));
      toast({ title: "Category deleted", description: res.message || "Category Deleted Successfully" });
    } catch (err) {
      toast({
        title: "Couldn’t delete category",
        description: ApiService.getErrorMessage(err, "Failed to delete category"),
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const grouped = groupCategoriesByType(categories);

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Categories</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gifts and team interests questions will score into. These are shared across every test.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          New category
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
              <DialogTitle className="font-serif text-2xl">{editing ? "Edit category" : "New category"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Change the name, type, or description. Questions keep this category until you delete it."
                  : "Name and type are required. Description is optional."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="category-name" className="field-label">
                  Name
                </label>
                <Input
                  id="category-name"
                  value={form.categoryName}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="field-label">Type</label>
                <Select
                  value={form.categoryType}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, categoryType: value as CategoryType }))}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GIFT">Gift</SelectItem>
                    <SelectItem value="TEAM">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="category-description" className="field-label">
                  Description
                </label>
                <Textarea
                  id="category-description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={textareaClass}
                />
              </div>
              {formError ? <p className="error-banner">{formError}</p> : null}
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save changes" : "Create category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {error ? <p className="error-banner">{error}</p> : null}

      {loading ? (
        <p className="py-8 text-center font-serif text-lg text-ink/60">Loading…</p>
      ) : error ? null : categories.length === 0 ? (
        <p className="rounded-xl bg-sand/70 px-4 py-8 text-center text-sm text-muted-foreground">
          No categories yet. Add a gift or team interest before you write questions.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.type}>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{group.label}</h3>
              {group.items.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">None yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {group.items.map((category) => {
                    const busy = pendingId === category.categoryId;
                    return (
                      <li key={category.categoryId} className="rounded-xl bg-sand/70 px-4 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-ink">{category.categoryName}</p>
                              <span className="rounded-full bg-azure/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-azure">
                                {formatCategoryType(category.categoryType)}
                              </span>
                            </div>
                            {category.description ? (
                              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
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
                                  <AlertDialogTitle className="font-serif">
                                    Delete {category.categoryName}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This permanently deletes the category, every question linked to it, and all scores
                                    from submitted tests. This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDelete(category)}
                                  >
                                    Delete category
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
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoriesSection;
