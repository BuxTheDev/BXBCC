import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

/* ---------------- layout ---------------- */

export function PageHeader({ title, sub, action, eyebrow }: { title: string; sub?: ReactNode; action?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</div>}
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-sm text-muted">{sub}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

/** The gradient band from the reference: greeting + inline KPI tiles. */
export function HeroBand({ title, sub, children, action }: { title: string; sub?: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <section className="hero-gradient relative mb-6 overflow-hidden rounded-2xl p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.02em] text-white">{title}</h1>
          {sub && <p className="mt-1.5 text-[15px] text-white/75">{sub}</p>}
        </div>
        {action}
      </div>
      {children && <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>}
    </section>
  );
}

/** KPI tile designed to sit inside HeroBand (glass on gradient). */
export function HeroStat({ label, value, delta, deltaTone = "up", icon }: {
  label: string; value: ReactNode; delta?: ReactNode; deltaTone?: "up" | "down" | "flat"; icon?: ReactNode;
}) {
  const tone = deltaTone === "up" ? "text-emerald-300" : deltaTone === "down" ? "text-rose-300" : "text-white/70";
  return (
    <div className="glass rounded-xl px-4 py-3.5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-white/80">
        {icon}<span>{label}</span>
      </div>
      <div className="tabular mt-1.5 text-[26px] font-semibold leading-none text-white">{value}</div>
      {delta && <div className={cn("mt-2 text-xs font-medium", tone)}>{delta}</div>}
    </div>
  );
}

export function Card({ title, sub, action, children, className, pad = true }: {
  title?: ReactNode; sub?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-surface", pad && "p-5", className)}>
      {(title || action) && (
        <header className={cn("mb-4 flex items-start justify-between gap-3", !pad && "px-5 pt-5")}>
          <div>
            {title && <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>}
            {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Grid({ cols = 2, children, className }: { cols?: 2 | 3 | 4; children: ReactNode; className?: string }) {
  const map = { 2: "lg:grid-cols-2", 3: "md:grid-cols-2 xl:grid-cols-3", 4: "sm:grid-cols-2 xl:grid-cols-4" };
  return <div className={cn("grid gap-4", map[cols], className)}>{children}</div>;
}

/* ---------------- data display ---------------- */

export function Stat({ label, value, sub, tone, icon, href }: {
  label: string; value: ReactNode; sub?: ReactNode; tone?: "ok" | "warn" | "bad" | "accent"; icon?: ReactNode; href?: string;
}) {
  const toneCls = tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : tone === "accent" ? "text-accent" : "";
  const body = (
    <div className={cn("rounded-2xl border border-border bg-surface p-4", href && "card-hover")}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {icon}<span>{label}</span>
      </div>
      <div className={cn("tabular mt-2 text-[24px] font-semibold leading-none tracking-[-0.02em]", toneCls)}>{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Badge({ children, tone = "muted", dot }: {
  children: ReactNode; tone?: "muted" | "accent" | "ok" | "warn" | "bad" | "outline"; dot?: string;
}) {
  const map: Record<string, string> = {
    muted: "bg-surface-3 text-fg-dim",
    accent: "bg-accent/15 text-accent",
    ok: "bg-ok/12 text-ok",
    warn: "bg-warn/12 text-warn",
    bad: "bg-bad/12 text-bad",
    outline: "border border-border text-muted",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-none", map[tone])}>
      {dot && <i className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  );
}

export function Table({ head, children, className }: { head: (string | ReactNode)[]; children: ReactNode; className?: string }) {
  return (
    <div className={cn("-mx-1 overflow-x-auto", className)}>
      <table className="w-full min-w-full text-sm">
        <thead>
          <tr className="text-left">
            {head.map((h, i) => (
              <th key={i} className="px-1 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:border-t [&_td]:border-border-soft [&_td]:px-1 [&_td]:py-2.5 [&_tr:hover]:bg-surface-2/40">
          {children}
        </tbody>
      </table>
    </div>
  );
}

/** Segmented progress bar (the Sprint 24 pattern from the reference). */
export function Segments({ parts, height = 8 }: { parts: { label: string; value: number; color: string }[]; height?: number }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="flex overflow-hidden rounded-full" style={{ height }}>
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${p.value}`} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-1.5 text-xs text-muted">
            <i className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            {p.label} <span className="tabular text-fg-dim">({p.value})</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Progress({ value, target, color = "var(--accent)", height = 6 }: { value: number; target: number; color?: string; height?: number }) {
  const pct = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
  return (
    <div className="w-full overflow-hidden rounded-full bg-surface-3" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Avatar({ name, color }: { name: string; color?: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  const palette = ["#8b5cf6", "#3b82f6", "#06b6d4", "#34d399", "#f472b6", "#fbbf24"];
  const bg = color ?? palette[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: bg }}>
      {initials}
    </span>
  );
}

/* ---------------- controls ---------------- */

export function Button({ children, variant = "primary", size = "md", className, ...rest }: {
  children: ReactNode; variant?: "primary" | "ghost" | "subtle"; size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:opacity-50";
  const sizes = { sm: "px-2.5 py-1.5 text-[12.5px]", md: "px-3.5 py-2 text-[13.5px]" };
  const variants = {
    primary: "hero-gradient text-white shadow-[0_2px_12px_-2px_rgba(124,92,255,.5)] hover:opacity-92",
    subtle: "bg-surface-3 text-fg hover:bg-[#272c3a]",
    ghost: "border border-border bg-surface text-fg-dim hover:bg-surface-2 hover:text-fg",
  };
  return <button {...rest} className={cn(base, sizes[size], variants[variant], className)}>{children}</button>;
}

export function LinkButton({ href, children, variant = "ghost" }: { href: string; children: ReactNode; variant?: "primary" | "ghost" | "subtle" }) {
  const variants = {
    primary: "hero-gradient text-white",
    subtle: "bg-surface-3 text-fg hover:bg-[#272c3a]",
    ghost: "border border-border bg-surface text-fg-dim hover:bg-surface-2 hover:text-fg",
  };
  return (
    <Link href={href} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition", variants[variant])}>
      {children}
    </Link>
  );
}

/** Pill tab row driven by URL search params (server-friendly). */
export function Tabs({ tabs, active, hrefFor }: { tabs: { key: string; label: string; count?: number }[]; active: string; hrefFor: (key: string) => string }) {
  return (
    <div className="mb-5 inline-flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={hrefFor(t.key)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition",
              on ? "bg-surface-3 text-fg shadow-sm" : "text-muted hover:text-fg-dim",
            )}
          >
            {t.label}
            {t.count != null && <span className="tabular ml-1.5 text-[11px] text-muted">{t.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
      <p className="text-sm text-muted">{children}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</h3>
      {action}
    </div>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center gap-3 border-b border-border-soft py-3 last:border-0", className)}>{children}</div>;
}

export const INCOME_TONE: Record<string, string> = {
  SI: "var(--c-si)", LI: "var(--c-li)", BOI: "var(--c-boi)", ABI: "var(--c-abi)", KBI: "var(--c-kbi)",
};

export function ClassBadge({ c }: { c: string | null | undefined }) {
  if (!c) return null;
  return <Badge dot={INCOME_TONE[c]}>{c}</Badge>;
}
