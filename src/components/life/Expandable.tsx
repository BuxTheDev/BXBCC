"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui";

/** Toggles a hidden form. Used for "Edit" rows and "Add" forms. */
export function Expandable({ label, openLabel = "Close", children, variant = "ghost" }: { label: string; openLabel?: string; children: ReactNode; variant?: "ghost" | "primary" }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button type="button" variant={variant} className="text-xs" onClick={() => setOpen(o => !o)}>{open ? openLabel : label}</Button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

/** A list where at most one row's editor is open at a time. */
export function EditableList<T extends { id: string }>({ items, row, editor }: { items: T[]; row: (item: T, toggle: () => void, open: boolean) => ReactNode; editor: (item: T) => ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <>
      {items.map(it => (
        <div key={it.id} className="border-t border-border">
          {row(it, () => setOpenId(openId === it.id ? null : it.id), openId === it.id)}
          {openId === it.id && <div className="pb-3">{editor(it)}</div>}
        </div>
      ))}
    </>
  );
}
