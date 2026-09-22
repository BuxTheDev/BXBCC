import Link from "next/link";
import { Card, Stat, Badge, PageHeader, Empty, LinkButton } from "@/components/ui";
import { ClassBadge, Progress, todayISO } from "@/components/life/helpers";
import { TaskCheck } from "@/components/life/TaskCheck";
import IncomeMix from "@/components/charts/IncomeMix";
import { usd, usdCompact, pct, dateShort, cn } from "@/lib/format";
import {
  getRoles, getFronts, getEntities, getNetWorth, getGoals, getIncomeSeries, getIncomeByClassT12,
  getPortfolio, getPipelineSummary, getTasks, getAlerts,
} from "@/lib/data";
import type { PipelineSummaryRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [roles, fronts, entities, nw, goals, series, t12, portfolio, pipeline, tasks, alerts] = await Promise.all([
    getRoles(), getFronts(), getEntities(), getNetWorth(), getGoals(), getIncomeSeries(), getIncomeByClassT12(),
    getPortfolio(), getPipelineSummary(), getTasks(), getAlerts(),
  ]);

  const active = fronts.filter(f => f.status === "active").sort((a, b) => a.rank - b.rank);
  const byPlace = new Map<string, number>();
  for (const f of fronts.filter(f => f.status !== "done")) byPlace.set(f.place ?? "Unspecified", (byPlace.get(f.place ?? "Unspecified") ?? 0) + 1);
  const byJur = new Map<string, number>();
  for (const e of entities) byJur.set(e.jurisdiction ?? "—", (byJur.get(e.jurisdiction ?? "—") ?? 0) + 1);

  const nwGoal = goals.find(g => g.metric === "net_worth");
  const target = nwGoal?.target_value ?? 30_000_000;
  const goalPct = target > 0 ? nw.net_worth / target : 0;

  const t12Total = Object.values(t12).reduce((a, b) => a + b, 0);
  const abiShare = t12Total > 0 ? t12.ABI / t12Total : 0;
  const boiShare = t12Total > 0 ? t12.BOI / t12Total : 0;

  const occRate = portfolio.total > 0 ? portfolio.occupied / portfolio.total : 0;

  const pipes = new Map<string, PipelineSummaryRow[]>();
  for (const r of pipeline) { if (!pipes.has(r.slug)) pipes.set(r.slug, []); pipes.get(r.slug)!.push(r); }

  const today = todayISO();
  const due = tasks
    .filter(t => t.status !== "done" && t.status !== "cancelled" && t.due_on && t.due_on <= today)
    .sort((a, b) => (a.due_on ?? "").localeCompare(b.due_on ?? ""));

  return (
    <div className="space-y-5">
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((a, i) => (
            <Link key={i} href={a.href ?? "/"}
              className={cn("rounded-md border px-2.5 py-1 text-xs", a.level === "warn" ? "border-warn/40 bg-warn/10 text-warn" : "border-border bg-surface-2 text-muted")}>
              {a.text}
            </Link>
          ))}
        </div>
      )}

      <PageHeader title="Command center" sub={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} />

      {/* Row 0: Orientation */}
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr_1fr]">
        <Card title="Roles">
          {roles.length === 0 ? <Empty>No roles</Empty> : (
            <ul className="space-y-2">
              {roles.map(r => (
                <li key={r.id}>
                  <div className="text-sm font-medium">{r.name}</div>
                  {r.commitment && <div className="text-xs text-muted">{r.commitment}</div>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Active fronts" action={<LinkButton href="/fronts">All fronts</LinkButton>}>
          {active.length === 0 ? <Empty>No active fronts</Empty> : (
            <ol className="divide-y divide-border">
              {active.map(f => (
                <li key={f.id} className="flex gap-3 py-2">
                  <div className="w-5 shrink-0 pt-0.5 text-right text-xs tabular-nums text-muted">{f.rank}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{f.name}</span>
                      <ClassBadge c={f.income_class} />
                      {f.place && <span className="text-[11px] text-muted">{f.place}</span>}
                    </div>
                    {f.current_state && <div className="mt-0.5 truncate text-xs text-muted">{f.current_state}</div>}
                    {f.next_action && <div className="mt-0.5 text-xs"><span className="text-muted">Next: </span>{f.next_action}</div>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Where">
          <div className="text-[11px] uppercase tracking-wide text-muted">Fronts by place</div>
          <ul className="mt-1 mb-3 space-y-1">
            {[...byPlace.entries()].sort((a, b) => b[1] - a[1]).map(([place, n]) => (
              <li key={place} className="flex justify-between text-sm"><span>{place}</span><span className="tabular-nums text-muted">{n}</span></li>
            ))}
          </ul>
          <div className="text-[11px] uppercase tracking-wide text-muted">Entities by jurisdiction</div>
          <ul className="mt-1 space-y-1">
            {[...byJur.entries()].sort((a, b) => b[1] - a[1]).map(([j, n]) => (
              <li key={j} className="flex justify-between text-sm"><span>{j}</span><span className="tabular-nums text-muted">{n}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Row 1: Position */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Net worth" value={usd(nw.net_worth)} tone={nw.net_worth >= 0 ? undefined : "bad"} />
        <Stat label="Liquid cash" value={usd(nw.liquid_cash)} />
        <Stat label="Total debt" value={usd(nw.total_debt)} />
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs uppercase tracking-wide text-muted">{nwGoal?.name ?? "$30M goal"}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{(goalPct * 100).toFixed(2)}%</div>
          <Progress value={goalPct} className="mt-2" tone="ok" />
          <div className="mt-1 text-xs text-muted">{usdCompact(nw.net_worth)} of {usdCompact(target)}</div>
        </div>
      </div>

      {/* Row 2: Income mix */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title="Income mix, trailing 12 months">
          <IncomeMix data={series} />
        </Card>
        <div className="grid gap-4">
          <Stat label="ABI share of T12 income" value={pct(abiShare)} sub={`${usd(t12.ABI)} of ${usd(t12Total)}`} tone={abiShare >= 0.25 ? "ok" : undefined} />
          <Stat label="BOI to ABI" value={pct(boiShare)} sub="BOI share of T12. Business operating income is the bridge; the target is converting it into asset-backed income." />
        </div>
      </div>

      {/* Row 3: Portfolio */}
      <Card title="Portfolio" action={<LinkButton href="/portfolio">Units</LinkButton>}>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Occupied" value={portfolio.occupied} tone="ok" />
          <Stat label="Vacant" value={portfolio.vacant} tone={portfolio.vacant > 0 ? "warn" : undefined} />
          <Stat label="Turning" value={portfolio.turning} />
          <Stat label="In acquisition" value={portfolio.in_acquisition} />
          <Stat label="Occupancy" value={pct(occRate)} sub={`${portfolio.occupied} of ${portfolio.total} units`} />
        </div>
      </Card>

      {/* Row 4: Pipeline */}
      <Card title="Pipeline" action={<LinkButton href="/deals">All deals</LinkButton>}>
        {pipes.size === 0 ? <Empty>No pipelines</Empty> : (
          <div className="grid gap-4 md:grid-cols-2">
            {[...pipes.entries()].map(([slug, rows]) => {
              const sorted = [...rows].sort((a, b) => a.sort - b.sort);
              const deals = sorted.reduce((s, r) => s + r.deals, 0);
              const value = sorted.reduce((s, r) => s + r.value, 0);
              const weighted = sorted.reduce((s, r) => s + r.weighted, 0);
              return (
                <Link key={slug} href={`/deals?pipeline=${slug}`} className="rounded-lg border border-border p-3 hover:bg-surface-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm font-medium">{sorted[0].pipeline}</div>
                    <div className="text-xs text-muted">{deals} open</div>
                  </div>
                  <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    {deals > 0 && sorted.map((r, i) => r.deals > 0 && (
                      <div key={r.stage} title={`${r.stage}: ${r.deals}`} style={{ width: `${(r.deals / deals) * 100}%`, background: "var(--accent)", opacity: 0.35 + (0.65 * (i + 1)) / sorted.length }} />
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted">
                    {sorted.map(r => <span key={r.stage}>{r.stage} <span className="tabular-nums text-fg">{r.deals}</span></span>)}
                  </div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span><span className="text-muted">Open </span><span className="tabular-nums">{usdCompact(value)}</span></span>
                    <span><span className="text-muted">Weighted </span><span className="tabular-nums">{usdCompact(weighted)}</span></span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Row 5: Today */}
      <Card title="Today" action={<LinkButton href="/tasks">All tasks</LinkButton>}>
        {due.length === 0 ? <Empty>Nothing due today. Clear.</Empty> : (
          <ul className="divide-y divide-border">
            {due.map(t => {
              const overdue = (t.due_on ?? "") < today;
              return (
                <li key={t.id} className="flex items-center gap-3 py-1.5 text-sm">
                  <TaskCheck id={t.id} done={false} />
                  <span className="flex-1">{t.title}</span>
                  {t.priority === "urgent" || t.priority === "high" ? <Badge tone={t.priority === "urgent" ? "bad" : "warn"}>{t.priority}</Badge> : null}
                  <span className={cn("text-xs tabular-nums", overdue ? "text-bad" : "text-muted")}>{overdue ? `overdue · ${dateShort(t.due_on)}` : "today"}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
