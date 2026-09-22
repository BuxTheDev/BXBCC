import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import type { Activity, Task, Unit } from "@/lib/types";

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <div className={className}><label>{label}</label>{children}</div>;
}

export function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-t border-border py-1.5 text-sm first:border-t-0">
      <span className="text-muted">{k}</span>
      <span className="text-right tabular-nums">{v ?? "—"}</span>
    </div>
  );
}

const ACT_TONE: Record<Activity["kind"], "muted" | "accent" | "ok" | "warn" | "bad"> = { note: "muted", call: "accent", sms: "accent", email: "accent", meeting: "ok", system: "muted" };
export const ActivityBadge = ({ kind }: { kind: Activity["kind"] }) => <Badge tone={ACT_TONE[kind] ?? "muted"}>{kind}</Badge>;

const PRI_TONE: Record<Task["priority"], "muted" | "accent" | "ok" | "warn" | "bad"> = { low: "muted", normal: "accent", high: "warn", urgent: "bad" };
export const PriorityBadge = ({ p }: { p: Task["priority"] }) => <Badge tone={PRI_TONE[p] ?? "muted"}>{p}</Badge>;

const UNIT_TONE: Record<Unit["status"], "muted" | "accent" | "ok" | "warn" | "bad"> = { occupied: "ok", vacant: "warn", turning: "muted", in_acquisition: "accent", offline: "bad" };
export const UnitBadge = ({ s }: { s: Unit["status"] }) => <Badge tone={UNIT_TONE[s] ?? "muted"}>{s.replace("_", " ")}</Badge>;

const DEAL_TONE: Record<string, "muted" | "accent" | "ok" | "warn" | "bad"> = { open: "accent", won: "ok", lost: "bad", stalled: "warn" };
export const DealStatusBadge = ({ s }: { s: string }) => <Badge tone={DEAL_TONE[s] ?? "muted"}>{s}</Badge>;

export function ActivityList({ items }: { items: Activity[] }) {
  return (
    <ol className="space-y-2">
      {items.map(a => (
        <li key={a.id} className="rounded-lg border border-border bg-surface-2/40 p-2.5 text-sm">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted">
            <ActivityBadge kind={a.kind} />
            <span>{new Date(a.occurred_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
          </div>
          <div className="whitespace-pre-wrap">{a.body ?? <span className="text-muted">(no body)</span>}</div>
        </li>
      ))}
    </ol>
  );
}
