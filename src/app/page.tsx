import Link from "next/link";
import {
  HeroBand, HeroStat, Tabs, Card, Badge, ClassBadge, Segments, Avatar,
  Empty, SectionLabel, Row, LinkButton,
} from "@/components/ui";
import { TaskCheck } from "@/components/app/TaskCheck";
import { PositionStats, IncomeMixCard, IncomeByClassCard } from "@/components/money/Position";
import GoalsTree from "@/components/money/GoalsTree";
import { usd, usdCompact, pct, dateShort, relTime, daysBetween, cn } from "@/lib/format";
import {
  getNetWorth, getDeals, getPortfolio, getAlerts, getAllVentureData, getPersonalFronts,
  getTasks, getFronts, getActivities, getContacts, getGoals, getUnits, getProperties,
} from "@/lib/data";
import type { Front, Task, Unit } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "today", label: "Today" },
  { key: "position", label: "Position" },
  { key: "movement", label: "Movement" },
];

const hrefFor = (k: string) => (k === "today" ? "/" : `/?tab=${k}`);

function greeting(hour: number) {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/** Muted-to-accent ramp for pipeline stage segments. */
function ramp(i: number, n: number) {
  const t = n <= 1 ? 1 : i / (n - 1);
  const from = [80, 86, 102];
  const to = [139, 92, 246];
  const c = from.map((v, k) => Math.round(v + (to[k] - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

/* ------------------------------------------------------------------ hero */

async function Hero() {
  const [nw, deals, portfolio] = await Promise.all([getNetWorth(), getDeals(), getPortfolio()]);
  const openValue = deals.filter((d) => d.status === "open").reduce((s, d) => s + Number(d.value), 0);
  const openCount = deals.filter((d) => d.status === "open").length;
  const occupancy = portfolio.total > 0 ? portfolio.occupied / portfolio.total : 0;
  const now = new Date();

  return (
    <HeroBand
      title={`Good ${greeting(now.getHours())}, Bryan`}
      sub={now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      action={<LinkButton href="/money">Open money</LinkButton>}
    >
      <HeroStat label="Net worth" value={usdCompact(nw.net_worth)} delta={usd(nw.net_worth)} deltaTone="flat" />
      <HeroStat label="Liquid cash" value={usdCompact(nw.liquid_cash)} delta={usd(nw.liquid_cash)} deltaTone="flat" />
      <HeroStat
        label="Open pipeline"
        value={usdCompact(openValue)}
        delta={`${openCount} open deal${openCount === 1 ? "" : "s"}`}
        deltaTone="flat"
      />
      <HeroStat
        label="Occupancy"
        value={pct(occupancy)}
        delta={`${portfolio.occupied} of ${portfolio.total} units`}
        deltaTone={occupancy >= 0.9 ? "up" : occupancy >= 0.6 ? "flat" : "down"}
      />
    </HeroBand>
  );
}

async function AlertStrip() {
  const alerts = await getAlerts();
  if (alerts.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {alerts.map((a, i) => (
        <Link
          key={i}
          href={a.href ?? "/"}
          className={cn(
            "rounded-full px-3 py-1.5 text-[12px] font-medium transition",
            a.level === "warn"
              ? "bg-warn/10 text-warn hover:bg-warn/15"
              : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-fg-dim",
          )}
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
            style={{ background: a.level === "warn" ? "var(--warn)" : "var(--muted)" }} />
          {a.text}
        </Link>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- today tab */

function FrontRow({ front, venture }: { front: Front; venture?: { slug: string; name: string; accent: string } }) {
  return (
    <Row className="items-start">
      <span className="tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[11px] font-semibold text-fg-dim">
        {front.rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {venture ? (
            <Link href={`/ventures/${venture.slug}`} className="text-sm font-semibold hover:text-accent">
              {front.name}
            </Link>
          ) : (
            <span className="text-sm font-semibold">{front.name}</span>
          )}
          {venture && <Badge dot={venture.accent}>{venture.name}</Badge>}
          <ClassBadge c={front.income_class} />
          {front.place && <span className="text-[11px] text-muted">{front.place}</span>}
        </div>
        {front.current_state && <p className="mt-1 truncate text-[13px] text-muted">{front.current_state}</p>}
        {front.next_action && (
          <p className="mt-0.5 text-[13px] text-fg-dim">
            <span className="text-muted">Next: </span>
            {front.next_action}
          </p>
        )}
      </div>
    </Row>
  );
}

async function ActiveFronts() {
  const [ventures, personal] = await Promise.all([getAllVentureData(), getPersonalFronts()]);
  // A front can match a venture by name or by entity; the explicit name listing wins.
  const claimed = new Map<string, { front: Front; venture: { slug: string; name: string; accent: string } }>();
  for (const byName of [true, false]) {
    for (const vd of ventures) {
      for (const f of vd.fronts) {
        if (f.status !== "active" || claimed.has(f.id)) continue;
        if (byName !== vd.venture.frontNames.includes(f.name)) continue;
        claimed.set(f.id, {
          front: f,
          venture: { slug: vd.venture.slug, name: vd.venture.short, accent: vd.venture.accent },
        });
      }
    }
  }
  const owned = [...claimed.values()].sort((a, b) => a.front.rank - b.front.rank);
  const solo = personal
    .filter((f) => f.status === "active" && !claimed.has(f.id))
    .sort((a, b) => a.rank - b.rank);

  return (
    <Card title="Active fronts" sub="Ranked by where the next hour goes" action={<LinkButton href="/ventures">Ventures</LinkButton>}>
      {owned.length === 0 && solo.length === 0 ? (
        <Empty>Nothing active. Every front is parked or done.</Empty>
      ) : (
        <>
          <div>
            {owned.map(({ front, venture }) => (
              <FrontRow key={front.id} front={front} venture={venture} />
            ))}
          </div>
          {solo.length > 0 && (
            <div className="mt-5">
              <SectionLabel>Personal</SectionLabel>
              <div>
                {solo.map((f) => (
                  <FrontRow key={f.id} front={f} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

const PRIORITY_TONE = { urgent: "bad", high: "warn", normal: "muted", low: "outline" } as const;

async function DueSoon() {
  const [tasks, fronts] = await Promise.all([getTasks(), getFronts()]);
  const frontName = (id: string | null) => (id ? fronts.find((f) => f.id === id)?.name : undefined);
  const now = new Date();
  const horizon = new Date(now.getTime() + 7 * 864e5).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const due: Task[] = tasks
    .filter((t) => t.status !== "done" && t.status !== "cancelled" && t.due_on && t.due_on <= horizon)
    .sort((a, b) => (a.due_on ?? "").localeCompare(b.due_on ?? ""));

  return (
    <Card title="Due & overdue" sub="Everything landing in the next seven days" action={<LinkButton href="/tasks">All tasks</LinkButton>}>
      {due.length === 0 ? (
        <Empty>Nothing due this week. Clear.</Empty>
      ) : (
        <div>
          {due.map((t) => {
            const overdue = (t.due_on ?? "") < today;
            const name = frontName(t.front_id);
            return (
              <Row key={t.id}>
                <TaskCheck id={t.id} status={t.status} />
                <span className="min-w-0 flex-1 truncate text-[13.5px]">{t.title}</span>
                {name && <span className="hidden truncate text-[11px] text-muted sm:inline">{name}</span>}
                <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                <span className={cn("tabular w-24 shrink-0 text-right text-[12px]", overdue ? "text-bad" : "text-muted")}>
                  {overdue ? `overdue ${dateShort(t.due_on)}` : t.due_on === today ? "today" : dateShort(t.due_on)}
                </span>
              </Row>
            );
          })}
        </div>
      )}
    </Card>
  );
}

const KIND_TONE = { call: "accent", email: "muted", sms: "muted", meeting: "ok", note: "outline", system: "muted" } as const;

async function RecentActivity() {
  const [activities, contacts] = await Promise.all([getActivities(), getContacts()]);
  const recent = [...activities]
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .slice(0, 8);

  return (
    <Card title="Recent activity" sub="Newest first">
      {recent.length === 0 ? (
        <Empty>No activity logged yet.</Empty>
      ) : (
        <div>
          {recent.map((a) => {
            const who = a.contact_id ? contacts.find((c) => c.id === a.contact_id)?.full_name : undefined;
            return (
              <Row key={a.id} className="items-start">
                <Avatar name={who ?? a.kind} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium">{who ?? a.kind}</span>
                    <Badge tone={KIND_TONE[a.kind]}>{a.kind}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-muted">{a.body ?? "—"}</p>
                </div>
                <span className="tabular shrink-0 text-[11px] text-muted">{relTime(a.occurred_at)}</span>
              </Row>
            );
          })}
        </div>
      )}
    </Card>
  );
}

async function TaskLoad() {
  const tasks = await getTasks();
  const count = (s: Task["status"]) => tasks.filter((t) => t.status === s).length;
  return (
    <Card title="Task load" sub="across all ventures">
      <Segments
        height={10}
        parts={[
          { label: "Done", value: count("done"), color: "var(--ok)" },
          { label: "In progress", value: count("doing"), color: "var(--accent-2)" },
          { label: "To do", value: count("todo"), color: "var(--warn)" },
        ]}
      />
    </Card>
  );
}

function TodayTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <ActiveFronts />
        <DueSoon />
      </div>
      <div className="space-y-4">
        <RecentActivity />
        <TaskLoad />
      </div>
    </div>
  );
}

/* -------------------------------------------------------- position tab */

async function GoalsCard() {
  const [goals, nw] = await Promise.all([getGoals(), getNetWorth()]);
  return (
    <Card title="Goals" sub="The ladder the numbers answer to">
      <GoalsTree goals={goals} overrides={{ net_worth: nw.net_worth }} />
    </Card>
  );
}

function PositionTab() {
  return (
    <div className="space-y-4">
      <PositionStats />
      <IncomeMixCard />
      <GoalsCard />
      <IncomeByClassCard />
    </div>
  );
}

/* -------------------------------------------------------- movement tab */

async function PipelineCard() {
  const ventures = await getAllVentureData();
  return (
    <Card title="Pipeline" sub="Open deals by venture" action={<LinkButton href="/deals">All deals</LinkButton>}>
      {ventures.length === 0 ? (
        <Empty>No ventures configured.</Empty>
      ) : (
        <div className="space-y-1">
          {ventures.map((vd) => {
            const open = vd.deals.filter((d) => d.status === "open");
            const stages = [...vd.stages].sort((a, b) => a.sort - b.sort);
            const parts = stages.map((s, i) => ({
              label: s.name,
              value: open.filter((d) => d.stage_id === s.id).length,
              color: ramp(i, stages.length),
            }));
            const hasDeals = parts.some((p) => p.value > 0);
            return (
              <div key={vd.venture.slug} className="border-b border-border-soft py-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/ventures/${vd.venture.slug}`} className="flex items-center gap-2 hover:text-accent">
                    <i className="h-2 w-2 rounded-full" style={{ background: vd.venture.accent }} />
                    <span className="text-sm font-semibold">{vd.venture.name}</span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12.5px]">
                    <span className="text-muted">
                      <span className="tabular text-fg">{open.length}</span> open
                    </span>
                    <span className="text-muted">
                      Value <span className="tabular text-fg">{usdCompact(vd.openValue)}</span>
                    </span>
                    <span className="text-muted">
                      Weighted <span className="tabular text-fg">{usdCompact(vd.weightedValue)}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  {hasDeals ? (
                    <Segments parts={parts} />
                  ) : (
                    <p className="text-[12.5px] text-muted">No open deals in this pipeline.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

const UNIT_TONE: Record<Unit["status"], "ok" | "warn" | "muted" | "accent" | "bad"> = {
  occupied: "ok",
  vacant: "warn",
  turning: "muted",
  in_acquisition: "accent",
  offline: "bad",
};

async function UnitsCard() {
  const [units, properties] = await Promise.all([getUnits(), getProperties()]);
  const prop = (id: string) => properties.find((p) => p.id === id);

  return (
    <Card title="Units" sub={`${units.length} across the portfolio`}>
      {units.length === 0 ? (
        <Empty>No units yet.</Empty>
      ) : (
        <div>
          {units.map((u) => {
            const p = prop(u.property_id);
            const vacantDays = u.vacant_since ? daysBetween(u.vacant_since) : null;
            return (
              <Row key={u.id} className="items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-medium">{u.name}</span>
                    <Badge tone={UNIT_TONE[u.status]}>{u.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {p ? `${p.address1}${p.city ? `, ${p.city}` : ""}${p.state ? `, ${p.state}` : ""}` : "Unlinked property"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="tabular text-[13px]">{u.target_rate != null ? `${usd(u.target_rate)}/mo` : "—"}</div>
                  {vacantDays != null && (
                    <div className={cn("tabular text-[11px]", vacantDays > 7 ? "text-warn" : "text-muted")}>
                      vacant {vacantDays}d
                    </div>
                  )}
                </div>
              </Row>
            );
          })}
        </div>
      )}
    </Card>
  );
}

async function NewThisWeek() {
  const [deals, contacts] = await Promise.all([getDeals(), getContacts()]);
  const cutoff = new Date().getTime() - 7 * 864e5;

  const items = [
    ...deals
      .filter((d) => +new Date(d.created_at) >= cutoff)
      .map((d) => ({ id: d.id, at: d.created_at, label: d.title, kind: "Deal", href: `/deals/${d.id}`, sub: usdCompact(d.value) })),
    ...contacts
      .filter((c) => +new Date(c.created_at) >= cutoff)
      .map((c) => ({ id: c.id, at: c.created_at, label: c.full_name, kind: "Contact", href: `/people/${c.id}`, sub: c.role ?? "" })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <Card title="New this week" sub="Deals and people added in the last seven days">
      {items.length === 0 ? (
        <Empty>Nothing new in the last seven days.</Empty>
      ) : (
        <div>
          {items.map((i) => (
            <Row key={`${i.kind}-${i.id}`}>
              <Badge tone={i.kind === "Deal" ? "accent" : "muted"}>{i.kind}</Badge>
              <Link href={i.href} className="min-w-0 flex-1 truncate text-[13.5px] font-medium hover:text-accent">
                {i.label}
              </Link>
              {i.sub && <span className="tabular shrink-0 text-[12px] text-muted">{i.sub}</span>}
              <span className="tabular w-10 shrink-0 text-right text-[11px] text-muted">{relTime(i.at)}</span>
            </Row>
          ))}
        </div>
      )}
    </Card>
  );
}

function MovementTab() {
  return (
    <div className="space-y-4">
      <PipelineCard />
      <div className="grid gap-4 lg:grid-cols-2">
        <UnitsCard />
        <NewThisWeek />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tab } = await searchParams;
  const key = typeof tab === "string" && TABS.some((t) => t.key === tab) ? tab : "today";

  return (
    <div>
      <Hero />
      <AlertStrip />
      <Tabs tabs={TABS} active={key} hrefFor={hrefFor} />
      {key === "position" ? <PositionTab /> : key === "movement" ? <MovementTab /> : <TodayTab />}
    </div>
  );
}
