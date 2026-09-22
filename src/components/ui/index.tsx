import Link from "next/link";
import { cn } from "@/lib/format";
import type { ReactNode } from "react";

export function Card({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-surface p-4", className)}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "ok" | "warn" | "bad" }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", tone === "ok" && "text-ok", tone === "warn" && "text-warn", tone === "bad" && "text-bad")}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "accent" | "ok" | "warn" | "bad" }) {
  const map = { muted: "bg-surface-2 text-muted", accent: "bg-accent-soft text-accent", ok: "bg-ok/10 text-ok", warn: "bg-warn/10 text-warn", bad: "bg-bad/10 text-bad" };
  return <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium", map[tone])}>{children}</span>;
}

export function PageHeader({ title, sub, action }: { title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-semibold">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Button({ children, variant = "primary", className, ...rest }: { children: ReactNode; variant?: "primary" | "ghost" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition", variant === "primary" ? "bg-accent text-white hover:opacity-90" : "border border-border bg-surface hover:bg-surface-2", className)}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-2">{children}</Link>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">{children}</div>;
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs uppercase tracking-wide text-muted">{head.map(h => <th key={h} className="pb-2 pr-3 font-medium">{h}</th>)}</tr></thead>
        <tbody className="[&_td]:border-t [&_td]:border-border [&_td]:py-2 [&_td]:pr-3">{children}</tbody>
      </table>
    </div>
  );
}

export const INCOME_TONE: Record<string, string> = { SI: "var(--c-si)", LI: "var(--c-li)", BOI: "var(--c-boi)", ABI: "var(--c-abi)", KBI: "var(--c-kbi)" };
