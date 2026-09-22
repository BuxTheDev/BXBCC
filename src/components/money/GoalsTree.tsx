import { Badge, Progress, Empty } from "@/components/ui";
import { cn } from "@/lib/format";
import { goalAmount } from "@/components/money/fields";
import type { Goal } from "@/lib/types";

const STATUS_TONE: Record<Goal["status"], "ok" | "accent" | "warn" | "muted"> = {
  achieved: "ok",
  active: "accent",
  paused: "warn",
  dropped: "muted",
};

/** Live values that override a goal's stored current_value, keyed by metric. */
export type GoalOverrides = Record<string, number>;

type GoalNode = Goal & { kids: GoalNode[] };

function Node({ goal, kids, overrides }: { goal: Goal; kids: GoalNode[]; overrides: GoalOverrides }) {
  const current =
    goal.metric && overrides[goal.metric] != null ? overrides[goal.metric] : Number(goal.current_value ?? 0);
  const target = Number(goal.target_value ?? 0);
  const ratio = target > 0 ? Math.min(1, current / target) : 0;
  const shownPct = ratio > 0 && ratio < 0.01 ? (ratio * 100).toFixed(2) : (ratio * 100).toFixed(0);

  return (
    <li>
      <div className="rounded-xl border border-border bg-surface-2/40 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{goal.name}</span>
            <Badge tone={STATUS_TONE[goal.status]}>{goal.status}</Badge>
          </div>
          {goal.horizon && <span className="text-[11px] text-muted">{goal.horizon}</span>}
        </div>
        {goal.why && <p className="mt-1 text-[13px] text-muted">{goal.why}</p>}
        <div className="mt-3">
          <Progress value={current} target={target || 1} color={ratio >= 1 ? "var(--ok)" : "var(--accent)"} />
          <div className="mt-2 flex items-baseline justify-between text-[12.5px]">
            <span className="tabular text-fg-dim">
              {goalAmount(current, goal.unit)} of {goalAmount(target, goal.unit)}
            </span>
            <span className={cn("tabular font-medium", ratio >= 1 ? "text-ok" : "text-muted")}>{shownPct}%</span>
          </div>
        </div>
      </div>
      {kids.length > 0 && <Branch goals={kids} overrides={overrides} depth={1} />}
    </li>
  );
}

function Branch({ goals, overrides, depth }: { goals: GoalNode[]; overrides: GoalOverrides; depth: number }) {
  return (
    <ul className={cn("space-y-3", depth > 0 && "ml-4 mt-3 border-l border-border pl-4")}>
      {goals.map((g) => (
        <Node key={g.id} goal={g} kids={g.kids} overrides={overrides} />
      ))}
    </ul>
  );
}

function build(goals: Goal[], parent: string | null): GoalNode[] {
  return goals
    .filter((g) => g.parent_id === parent)
    .map((g) => ({ ...g, kids: build(goals, g.id) }));
}

/** Goal tree nested by parent_id, with live overrides for computed metrics. */
export default function GoalsTree({ goals, overrides = {} }: { goals: Goal[]; overrides?: GoalOverrides }) {
  if (goals.length === 0) return <Empty>No goals yet.</Empty>;
  const sorted = [...goals].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
  const ids = new Set(sorted.map((g) => g.id));
  // A goal whose parent is missing still needs to appear, so treat it as a root.
  const rooted = sorted.map((g) => (g.parent_id && ids.has(g.parent_id) ? g : { ...g, parent_id: null }));
  return <Branch goals={build(rooted, null)} overrides={overrides} depth={0} />;
}
