import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import type { IncomeClass } from "@/lib/types";

export interface Option {
  value: string;
  label: string;
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Select({
  name,
  options,
  value,
  placeholder = "—",
  required,
  onChange,
}: {
  name?: string;
  options: Option[];
  value?: string | null;
  placeholder?: string;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <select name={name} defaultValue={value ?? ""} required={required} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Shared shell for the add/edit forms under each Money tab. */
export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>
  );
}

export const INCOME_OPTIONS: Option[] = (["SI", "LI", "BOI", "ABI", "KBI"] as IncomeClass[]).map((c) => ({
  value: c,
  label: c,
}));

export const entityOptions = (rows: { id: string; name: string }[]): Option[] =>
  rows.map((e) => ({ value: e.id, label: e.name }));

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** Money-ish goal units render as currency; everything else as a plain count. */
export function goalAmount(value: number, unit: string | null) {
  const money = (unit ?? "").toUpperCase().startsWith("USD");
  if (money) {
    const s = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
    return (unit ?? "").includes("/mo") ? `${s}/mo` : s;
  }
  return `${value.toLocaleString()}${unit ? ` ${unit}` : ""}`;
}
