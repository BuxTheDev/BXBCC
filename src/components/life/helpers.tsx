import { Badge } from "@/components/ui";
import type { IncomeClass } from "@/lib/types";
import { cn } from "@/lib/format";
import type { ReactNode } from "react";

const CLASS_TONE: Record<IncomeClass, "muted" | "accent" | "ok" | "warn" | "bad"> = { SI: "muted", LI: "muted", BOI: "accent", ABI: "ok", KBI: "warn" };

export function ClassBadge({ c }: { c: IncomeClass | null | undefined }) {
  if (!c) return <span className="text-xs text-muted">—</span>;
  return <Badge tone={CLASS_TONE[c]}>{c}</Badge>;
}

export function Progress({ value, className, tone }: { value: number; className?: string; tone?: "ok" | "accent" | "warn" }) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div className={cn("h-full rounded-full", tone === "ok" ? "bg-ok" : tone === "warn" ? "bg-warn" : "bg-accent")} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <div className={className}><label>{label}</label>{children}</div>;
}

export function Select({ name, options, value, placeholder = "—", required }: { name: string; options: Array<{ value: string; label: string }>; value?: string | null; placeholder?: string; required?: boolean }) {
  return (
    <select name={name} defaultValue={value ?? ""} required={required}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export const INCOME_OPTIONS = (["SI", "LI", "BOI", "ABI", "KBI"] as IncomeClass[]).map(c => ({ value: c, label: c }));
export const todayISO = () => new Date().toISOString().slice(0, 10);
