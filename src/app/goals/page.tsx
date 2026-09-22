import { Card, PageHeader, Badge, Empty } from "@/components/ui";
import { Progress } from "@/components/life/helpers";
import { Expandable } from "@/components/life/Expandable";
import { GoalForm } from "@/components/life/GoalForm";
import { getGoals, getNetWorth } from "@/lib/data";
import type { Goal } from "@/lib/types";

export const dynamic = "force-dynamic";

const fmtVal = (n: number, unit: string | null) => unit && unit.toUpperCase().startsWith("USD")
  ? `$${Math.round(n).toLocaleString("en-US")}${unit.length > 3 ? unit.slice(3) : ""}`
  : `${Number.isInteger(n) ? n : n.toFixed(1)}${unit ? ` ${unit}` : ""}`;

function GoalNode({ g, all, depth }: { g: Goal; all: Goal[]; depth: number }) {
  const kids = all.filter(k => k.parent_id === g.id).sort((a, b) => a.sort - b.sort);
  const ratio = g.target_value && g.target_value > 0 ? g.current_value / g.target_value : 0;
  const tone = g.status === "achieved" ? "ok" : g.status === "active" ? "accent" : "muted";
  return (
    <div className={depth > 0 ? "ml-4 border-l border-border pl-4" : ""}>
      <div className="py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{g.name}</span>
          <Badge tone={tone}>{g.status}</Badge>
          {g.horizon && <span className="text-[11px] text-muted">by {g.horizon}</span>}
          {g.metric && <span className="font-mono text-[11px] text-muted">{g.metric}</span>}
        </div>
        {g.target_value != null && (
          <div className="mt-2 max-w-xl">
            <div className="flex justify-between text-xs tabular-nums">
              <span>{fmtVal(g.current_value, g.unit)}</span>
              <span className="text-muted">{(ratio * 100).toFixed(ratio < 0.1 ? 2 : 0)}% of {fmtVal(g.target_value, g.unit)}</span>
            </div>
            <Progress value={ratio} className="mt-1" tone={g.status === "achieved" ? "ok" : "accent"} />
          </div>
        )}
        {g.why && <div className="mt-1 text-xs text-muted">{g.why}</div>}
        <div className="mt-2"><Expandable label="Edit"><GoalForm goal={g} goals={all} /></Expandable></div>
      </div>
      {kids.map(k => <GoalNode key={k.id} g={k} all={all} depth={depth + 1} />)}
    </div>
  );
}

export default async function GoalsPage() {
  const [raw, nw] = await Promise.all([getGoals(), getNetWorth()]);
  // Net-worth goals read live from the balance sheet rather than the stored current_value.
  const goals = raw.map(g => g.metric === "net_worth" ? { ...g, current_value: nw.net_worth } : g);
  const roots = goals.filter(g => !g.parent_id).sort((a, b) => a.sort - b.sort);
  return (
    <div className="space-y-5">
      <PageHeader title="Goals & plans" sub="Nested by parent. Progress is current over target." />
      <Card title="Goal tree">
        {roots.length === 0 ? <Empty>No goals yet</Empty> : (
          <div className="divide-y divide-border">{roots.map(g => <GoalNode key={g.id} g={g} all={goals} depth={0} />)}</div>
        )}
      </Card>
      <Card title="Add goal"><GoalForm goals={goals} /></Card>
    </div>
  );
}
