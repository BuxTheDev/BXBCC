import Link from "next/link";
import { getTasks, getFronts } from "@/lib/data";
import { dateShort } from "@/lib/format";
import { Card, PageHeader, Empty } from "@/components/ui";
import { PriorityBadge } from "@/components/crm/helpers";
import TaskCheckbox from "@/components/crm/TaskCheckbox";
import AddTaskForm from "@/components/crm/AddTaskForm";
import type { Task } from "@/lib/types";

const PRI_ORDER: Record<Task["priority"], number> = { urgent: 0, high: 1, normal: 2, low: 3 };

export default async function TasksPage() {
  const [tasks, fronts] = await Promise.all([getTasks(), getFronts()]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayMs = 864e5;
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const weekEnd = new Date(+today + (6 - dow) * dayMs);
  const at = (s: string) => { const d = new Date(s + (s.length === 10 ? "T00:00:00" : "")); d.setHours(0, 0, 0, 0); return +d; };

  const openTasks = tasks.filter(t => t.status === "todo" || t.status === "doing");
  const sortFn = (a: Task, b: Task) => (PRI_ORDER[a.priority] - PRI_ORDER[b.priority]) || ((a.due_on ?? "9999").localeCompare(b.due_on ?? "9999"));
  const groups: Array<{ label: string; items: Task[]; tone?: "warn" }> = [
    { label: "Overdue", items: openTasks.filter(t => t.due_on && at(t.due_on) < +today).sort(sortFn), tone: "warn" },
    { label: "Today", items: openTasks.filter(t => t.due_on && at(t.due_on) === +today).sort(sortFn) },
    { label: "This week", items: openTasks.filter(t => t.due_on && at(t.due_on) > +today && at(t.due_on) <= +weekEnd).sort(sortFn) },
    { label: "Later", items: openTasks.filter(t => !t.due_on || at(t.due_on) > +weekEnd).sort(sortFn) },
    { label: "Done", items: tasks.filter(t => t.status === "done").slice(0, 20) },
  ];
  const frontName = (id: string | null) => fronts.find(f => f.id === id)?.name ?? null;
  const recordHref = (t: Task) => t.record_type === "deal" && t.record_id ? `/deals/${t.record_id}` : t.record_type === "contact" && t.record_id ? `/contacts/${t.record_id}` : null;

  return (
    <>
      <PageHeader title="Tasks" sub={`${openTasks.length} open · ${groups[0].items.length} overdue`} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {groups.map(g => (
            <Card key={g.label} title={<span className={g.tone === "warn" && g.items.length ? "text-warn" : undefined}>{g.label} <span className="font-normal">({g.items.length})</span></span>}>
              {g.items.length ? (
                <ul className="divide-y divide-border">
                  {g.items.map(t => {
                    const done = t.status === "done";
                    const href = recordHref(t);
                    return (
                      <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
                        <TaskCheckbox id={t.id} done={done} />
                        <div className={"min-w-0 flex-1 " + (done ? "text-muted line-through" : "")}>
                          <div className="truncate">{t.title}{t.status === "doing" && <span className="ml-2 text-xs text-accent">in progress</span>}</div>
                          {t.notes && <div className="truncate text-xs text-muted">{t.notes}</div>}
                        </div>
                        <PriorityBadge p={t.priority} />
                        <span className="w-16 text-right text-xs tabular-nums text-muted">{dateShort(t.due_on)}</span>
                        <span className="w-28 truncate text-right text-xs text-muted">{frontName(t.front_id) ?? ""}</span>
                        <span className="w-16 text-right text-xs">{href ? <Link href={href} className="text-accent hover:underline">{t.record_type}</Link> : ""}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : <Empty>Nothing here.</Empty>}
            </Card>
          ))}
        </div>
        <div>
          <Card title="Add task" className="sticky top-6"><AddTaskForm fronts={fronts} compact /></Card>
        </div>
      </div>
    </>
  );
}
