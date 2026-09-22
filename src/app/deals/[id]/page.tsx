import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeals, getPipelines, getStages, getContacts, getEntities, getFronts, getActivities, getTasks } from "@/lib/data";
import { usd, dateShort, daysBetween } from "@/lib/format";
import { Card, PageHeader, Badge, Empty, Table } from "@/components/ui";
import { KV, DealStatusBadge, PriorityBadge, ActivityList } from "@/components/crm/helpers";
import AddActivityForm from "@/components/crm/AddActivityForm";
import AddTaskForm from "@/components/crm/AddTaskForm";
import TaskCheckbox from "@/components/crm/TaskCheckbox";

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deals, pipelines, stages, contacts, entities, fronts, activities, tasks] = await Promise.all([
    getDeals(), getPipelines(), getStages(), getContacts(), getEntities(), getFronts(), getActivities(), getTasks(),
  ]);
  const deal = deals.find(d => d.id === id);
  if (!deal) notFound();

  const pipeline = pipelines.find(p => p.id === deal.pipeline_id);
  const stage = stages.find(s => s.id === deal.stage_id);
  const contact = contacts.find(c => c.id === deal.primary_contact_id);
  const entity = entities.find(e => e.id === deal.entity_id);
  const front = fronts.find(f => f.id === deal.front_id);
  const acts = activities.filter(a => a.record_type === "deal" && a.record_id === deal.id)
    .sort((a, b) => +new Date(b.occurred_at) - +new Date(a.occurred_at));
  const dealTasks = tasks.filter(t => t.record_type === "deal" && t.record_id === deal.id);
  const offer = Object.entries(deal.offer_fields ?? {});
  const fmt = (v: unknown) => typeof v === "number" ? v.toLocaleString("en-US") : typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "—");

  return (
    <>
      <PageHeader
        title={deal.title}
        sub={<span className="flex flex-wrap items-center gap-2">
          <Link href={`/deals?pipeline=${pipeline?.slug ?? ""}`} className="hover:text-accent">{pipeline?.name ?? "Pipeline"}</Link>
          <span>/</span><span>{stage?.name ?? "No stage"}</span>
          <DealStatusBadge s={deal.status} />
          <span className="tabular-nums font-medium text-fg">{usd(deal.value)}</span>
          <span>· close {dateShort(deal.expected_close)}</span>
          <span>· last activity {daysBetween(deal.last_activity_at)}d ago</span>
        </span>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card title="Contact">
            {contact ? (
              <div className="text-sm">
                <Link href={`/contacts/${contact.id}`} className="font-medium hover:text-accent">{contact.full_name}</Link>
                {contact.role && <div className="mt-1"><Badge>{contact.role}</Badge></div>}
                <div className="mt-2 text-muted">{contact.email ?? "—"}</div>
                <div className="text-muted">{contact.phone ?? "—"}</div>
              </div>
            ) : <Empty>No primary contact.</Empty>}
          </Card>
          <Card title="Context">
            <KV k="Entity" v={entity?.name} />
            <KV k="Front" v={front?.name} />
            <KV k="Source" v={deal.source} />
            <KV k="Created" v={dateShort(deal.created_at)} />
          </Card>
          {offer.length > 0 && (
            <Card title="Offer fields">
              {offer.map(([k, v]) => <KV key={k} k={k.replace(/_/g, " ")} v={fmt(v)} />)}
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card title="Activity">
            <AddActivityForm recordType="deal" recordId={deal.id} contactId={deal.primary_contact_id} />
            <div className="mt-4">
              {acts.length ? <ActivityList items={acts} /> : <Empty>No activity logged yet.</Empty>}
            </div>
          </Card>
          <Card title="Tasks">
            {dealTasks.length ? (
              <Table head={["", "Task", "Priority", "Due"]}>
                {dealTasks.map(t => (
                  <tr key={t.id} className={t.status === "done" ? "text-muted line-through" : ""}>
                    <td className="w-6"><TaskCheckbox id={t.id} done={t.status === "done"} /></td>
                    <td>{t.title}</td>
                    <td><PriorityBadge p={t.priority} /></td>
                    <td className="tabular-nums">{dateShort(t.due_on)}</td>
                  </tr>
                ))}
              </Table>
            ) : <Empty>No tasks on this deal.</Empty>}
            <div className="mt-4 border-t border-border pt-3">
              <AddTaskForm fronts={fronts} recordType="deal" recordId={deal.id} compact />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
