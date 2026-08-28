"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { toast } from "sonner";

interface AddCustomItemProps {
  type: "prayer" | "zikr" | "tilawat" | "hifazat";
  onAdd: (name: string, hint?: string) => Promise<void>;
  placeholder: string;
  hintPlaceholder?: string;
  showHint?: boolean;
}

export default function AddCustomItem({
  type,
  onAdd,
  placeholder,
  hintPlaceholder,
  showHint = false,
}: AddCustomItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    
    setLoading(true);
    try {
      await onAdd(name.trim(), hint.trim() || undefined);
      setName("");
      setHint("");
      setIsOpen(false);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
    } catch (error) {
      toast.error("Failed to add item", {
        description: "Please try again.",
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
        Add custom {type}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-foreground/80">
          Name
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
            Hint (optional)
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
          {loading ? "Adding..." : "Add"}
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
          Cancel
        </button>
      </div>
    </form>
  );
}
