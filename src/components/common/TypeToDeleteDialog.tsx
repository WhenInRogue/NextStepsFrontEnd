import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const DELETE_CONFIRM_WORD = "DELETE";

const TypeToDeleteDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
}) => {
  const [confirm, setConfirm] = useState("");
  const canConfirm = confirm.trim() === DELETE_CONFIRM_WORD;

  useEffect(() => {
    if (!open) setConfirm("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!canConfirm || pending) return;
            void onConfirm();
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-serif">{title}</DialogTitle>
            <DialogDescription>
              {description} Type {DELETE_CONFIRM_WORD} to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="type-to-delete-confirm" className="field-label">
              Type {DELETE_CONFIRM_WORD}
            </label>
            <Input
              id="type-to-delete-confirm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="off"
              autoFocus
              spellCheck={false}
              placeholder={DELETE_CONFIRM_WORD}
              disabled={pending}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!canConfirm || pending}>
              {pending ? "Deleting…" : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TypeToDeleteDialog;
