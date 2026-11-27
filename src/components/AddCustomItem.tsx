"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { toast } from "sonner";

type AddCustomLabels = {
  open: string;
  name: string;
  hint: string;
  add: string;
  adding: string;
  cancel: string;
  nameRequired: string;
  nameTooShort: string;
  added: (name: string) => string;
  addFail: string;
  addFailHint: string;
};

const DEFAULT_LABELS: AddCustomLabels = {
  open: "Add custom item",
  name: "Name",
  hint: "Hint (optional)",
  add: "Add",
  adding: "Adding...",
  cancel: "Cancel",
  nameRequired: "Please enter a name",
  nameTooShort: "Name must be at least 2 characters",
  added: (name: string) => `${name} added successfully`,
  addFail: "Failed to add item",
  addFailHint: "Please try again.",
};

interface AddCustomItemProps {
  type: "prayer" | "zikr" | "tilawat" | "hifazat";
  onAdd: (name: string, hint?: string) => Promise<void>;
  placeholder: string;
  hintPlaceholder?: string;
  showHint?: boolean;
  labels?: Partial<AddCustomLabels>;
}

export default function AddCustomItem({
  type,
  onAdd,
  placeholder,
  hintPlaceholder,
  showHint = false,
  labels,
}: AddCustomItemProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(text.nameRequired);
      return;
    }

    if (name.trim().length < 2) {
      toast.error(text.nameTooShort);
      return;
    }

    setLoading(true);
    try {
      await onAdd(name.trim(), hint.trim() || undefined);
      setName("");
      setHint("");
      setIsOpen(false);
      toast.success(text.added(name.trim()));
    } catch {
      toast.error(text.addFail, {
        description: text.addFailHint,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-muted/50 px-4 py-3 text-sm font-medium text-foreground/60 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
      >
        <PlusIcon className="h-4 w-4" />
        {text.open}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-foreground/80">
          {text.name}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          autoFocus
        />
      </div>

      {showHint && (
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-foreground/80">
            {text.hint}
          </label>
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder={hintPlaceholder}
            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
        >
          {loading ? text.adding : text.add}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setName("");
            setHint("");
          }}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          {text.cancel}
        </button>
      </div>
    </form>
  );
}
