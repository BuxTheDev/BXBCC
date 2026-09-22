import Link from "next/link";
import { AlertTriangle, CalendarDays, CalendarRange, CheckCircle2, ExternalLink } from "lucide-react";
import { getTasks, getFronts } from "@/lib/data";
import { createTask } from "@/lib/actions";
import { dateShort } from "@/lib/format";
import { Badge, Button, Card, Empty, Grid, PageHeader, Row, Stat } from "@/components/ui";
import { Field } from "@/components/crm/helpers";
import { VentureChip } from "@/components/crm/VentureChip";
import { TaskCheck } from "@/components/app/TaskCheck";
import type { Task } from "@/lib/types";

const PRI_ORDER: Record<Task["priority"], number> = { urgent: 0, high: 1, normal: 2, low: 3 };
const PRI_TONE: Record<Task["priority"], "bad" | "warn" | "muted" | "outline"> = {
  urgent: "bad", high: "warn", normal: "muted", low: "outline",
};

const dayStart = (s: string) => {
  const d = new Date(s + (s.length === 10 ? "T00:00:00" : ""));
  d.setHours(0, 0, 0, 0);
  return +d;
};

export default async function TasksPage() {
  const [tasks, fronts] = await Promise.all([getTasks(), getFronts()]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const weekStart = +today - dow * 864e5;
  const weekEnd = +today + (6 - dow) * 864e5;

  const open = tasks.filter((t) => t.status === "todo" || t.status === "doing");
  const sortFn = (a: Task, b: Task) =>
    (PRI_ORDER[a.priority] - PRI_ORDER[b.priority]) || ((a.due_on ?? "9999").localeCompare(b.due_on ?? "9999"));

  const overdue = open.filter((t) => t.due_on && dayStart(t.due_on) < +today).sort(sortFn);
  const dueToday = open.filter((t) => t.due_on && dayStart(t.due_on) === +today).sort(sortFn);
  const thisWeek = open.filter((t) => t.due_on && dayStart(t.due_on) > +today && dayStart(t.due_on) <= weekEnd).sort(sortFn);
  const later = open.filter((t) => !t.due_on || dayStart(t.due_on) > weekEnd).sort(sortFn);

  const completedAt = (t: Task) => (t as Task & { completed_at?: string | null }).completed_at ?? null;
  const done = tasks.filter((t) => t.status === "done");
  const doneThisWeek = done.filter((t) => {
    const at = completedAt(t);
    return at ? +new Date(at) >= weekStart : true;
  });
  const recentlyDone = [...done]
    .sort((a, b) => (completedAt(b) ?? "").localeCompare(completedAt(a) ?? ""))
    .slice(0, 15);

  const frontName = (id: string | null) => fronts.find((f) => f.id === id)?.name ?? null;
  const recordHref = (t: Task) =>
    t.record_type === "deal" && t.record_id ? `/deals/${t.record_id}`
      : t.record_type === "contact" && t.record_id ? `/people/${t.record_id}`
        : null;

  const groups: Array<{ label: string; items: Task[]; sub?: string }> = [
    { label: "Overdue", items: overdue },
    { label: "Today", items: dueToday },
    { label: "This week", items: thisWeek },
    { label: "Later", items: later },
    { label: "Recently done", items: recentlyDone, sub: "Last 15 completed" },
  ];

  const TaskRow = ({ t }: { t: Task }) => {
    const od = t.status !== "done" && t.due_on != null && dayStart(t.due_on) < +today;
    const href = recordHref(t);
    return (
      <Row>
        <TaskCheck id={t.id} status={t.status} />
        <span className={`min-w-0 flex-1 truncate text-[13.5px] ${t.status === "done" ? "text-muted line-through" : ""}`}>
          {t.title}
        </span>
        <VentureChip frontName={frontName(t.front_id)} />
        <Badge tone={PRI_TONE[t.priority]}>{t.priority}</Badge>
        <span className={`tabular w-16 shrink-0 text-right text-[12.5px] ${od ? "text-bad" : "text-muted"}`}>
          {dateShort(t.due_on)}
        </span>
        <span className="w-5 shrink-0 text-right">
          {href ? (
            <Link href={href} className="text-muted hover:text-accent" aria-label="Open related record">
              <ExternalLink size={13} />
            </Link>
          ) : null}
        </span>
      </Row>
    );
  };

  return (
    <>
      <PageHeader title="Tasks" sub={`${open.length} open · ${overdue.length} overdue`} />

      <Grid cols={4} className="mb-4">
        <Stat label="Overdue" value={overdue.length} tone={overdue.length ? "bad" : undefined} icon={<AlertTriangle size={13} />} />
        <Stat label="Due today" value={dueToday.length} icon={<CalendarDays size={13} />} />
        <Stat label="This week" value={thisWeek.length} icon={<CalendarRange size={13} />} />
        <Stat label="Done this week" value={doneThisWeek.length} tone="ok" icon={<CheckCircle2 size={13} />} />
      </Grid>

      <div className="space-y-4">
        {groups.map((g) => (
          <Card
            key={g.label}
            title={
              <span className="flex items-center gap-2">
                {g.label}
                <span className="tabular text-[12px] font-normal text-muted">{g.items.length}</span>
              </span>
            }
            sub={g.sub}
          >
            {g.items.length ? (
              <div>{g.items.map((t) => <TaskRow key={t.id} t={t} />)}</div>
            ) : (
              <Empty>Nothing here.</Empty>
            )}
          </Card>
        ))}

        <Card title="New task">
          <form action={createTask} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="Title" className="md:col-span-2"><input name="title" required /></Field>
              <Field label="Priority">
                <select name="priority" defaultValue="normal">
                  {["low", "normal", "high", "urgent"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Due"><input type="date" name="due_on" /></Field>
              <Field label="Front" className="md:col-span-2">
                <select name="front_id" defaultValue="">
                  <option value="">—</option>
                  {fronts.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
              <Field label="Notes" className="md:col-span-2"><input name="notes" /></Field>
            </div>
            <div className="flex justify-end"><Button type="submit">Add task</Button></div>
          </form>
        </Card>
      </div>
    </>
  );
}
