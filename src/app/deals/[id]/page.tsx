import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeals, getPipelines, getStages, getContacts, getEntities, getFronts, getActivities, getTasks } from "@/lib/data";
import { usd, dateShort, daysBetween, relTime } from "@/lib/format";
import { VENTURES } from "@/lib/ventures";
import { Avatar, Badge, Card, Empty, Grid, PageHeader, Row, SectionLabel } from "@/components/ui";
import { KV, DealStatusBadge, PriorityBadge, ActivityBadge } from "@/components/crm/helpers";
import AddActivityForm from "@/components/crm/AddActivityForm";
import AddTaskForm from "@/components/crm/AddTaskForm";
import { TaskCheck } from "@/components/app/TaskCheck";

const MONEY_KEYS = /(price|down|financed|payment|cash|rent|fee|value|amount|arv|offer|spread|deposit|credit|balance|cost)/i;

function offerValue(k: string, v: unknown) {
  if (typeof v === "number") return MONEY_KEYS.test(k) ? usd(v) : v.toLocaleString("en-US");
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deals, pipelines, stages, contacts, entities, fronts, activities, tasks] = await Promise.all([
    getDeals(), getPipelines(), getStages(), getContacts(), getEntities(), getFronts(), getActivities(), getTasks(),
  ]);
  const deal = deals.find((d) => d.id === id);
  if (!deal) notFound();

  const pipeline = pipelines.find((p) => p.id === deal.pipeline_id);
  const stage = stages.find((s) => s.id === deal.stage_id);
  const contact = contacts.find((c) => c.id === deal.primary_contact_id);
  const entity = entities.find((e) => e.id === deal.entity_id);
  const front = fronts.find((f) => f.id === deal.front_id);
  const venture = VENTURES.find(
    (v) => (pipeline?.venture && v.pipelineVenture.includes(pipeline.venture))
      || (front && v.frontNames.includes(front.name))
      || (entity && v.entityNames.includes(entity.name)),
  );

  const acts = activities
    .filter((a) => a.record_type === "deal" && a.record_id === deal.id)
    .sort((a, b) => +new Date(b.occurred_at) - +new Date(a.occurred_at));
  const dealTasks = tasks.filter((t) => t.record_type === "deal" && t.record_id === deal.id);
  const offer = Object.entries(deal.offer_fields ?? {});
  const idle = daysBetween(deal.last_activity_at);

  return (
    <>
      <PageHeader
        eyebrow={venture?.name ?? pipeline?.name}
        title={deal.title}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            {pipeline && <Badge dot={venture?.accent}>{pipeline.name}</Badge>}
            <Badge tone="accent">{stage?.name ?? "No stage"}</Badge>
            <DealStatusBadge s={deal.status} />
            <Badge tone={idle > 14 ? "warn" : "muted"}>{idle}d idle</Badge>
          </span>
        }
        action={
          <div className="text-right">
            <div className="tabular text-[28px] font-semibold leading-none tracking-[-0.02em]">{usd(deal.value)}</div>
            <div className="mt-1.5 text-[12px] text-muted">close {dateShort(deal.expected_close)}</div>
          </div>
        }
      />

      <Grid cols={3} className="mb-4">
        <Card title="Context">
          <KV
            k="Contact"
            v={contact ? <Link href={`/people/${contact.id}`} className="font-medium hover:text-accent">{contact.full_name}</Link> : "—"}
          />
          <KV k="Phone" v={contact?.phone ?? "—"} />
          <KV k="Entity" v={entity?.name ?? "—"} />
          <KV
            k="Venture"
            v={venture ? <Link href={`/ventures/${venture.slug}`} className="hover:text-accent">{venture.name}</Link> : "—"}
          />
          <KV k="Front" v={front?.name ?? "—"} />
          <KV k="Source" v={deal.source ?? "—"} />
          <KV k="Created" v={dateShort(deal.created_at)} />
        </Card>

        <Card title="Offer" sub={offer.length ? "Pushed by Salvo" : undefined} className="lg:col-span-2">
          {offer.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {offer.map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border-soft bg-surface-2/50 p-3.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{k.replace(/_/g, " ")}</div>
                  <div className="tabular mt-1.5 text-[18px] font-semibold leading-none tracking-[-0.01em]">{offerValue(k, v)}</div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>No offer fields on this deal yet.</Empty>
          )}
        </Card>
      </Grid>

      <Grid cols={2}>
        <Card title="Activity" sub={`${acts.length} entries`}>
          <AddActivityForm recordType="deal" recordId={deal.id} contactId={deal.primary_contact_id} />
          <div className="mt-5 border-t border-border-soft pt-1">
            {acts.length ? (
              <div>
                {acts.map((a) => (
                  <Row key={a.id} className="items-start">
                    <Avatar name={contacts.find((c) => c.id === a.contact_id)?.full_name ?? deal.title} />
                    <span className="min-w-0 flex-1">
                      <span className="block whitespace-pre-wrap text-[13.5px] leading-relaxed text-fg-dim">{a.body ?? "(no body)"}</span>
                      <span className="mt-1.5 block"><ActivityBadge kind={a.kind} /></span>
                    </span>
                    <span className="tabular shrink-0 text-[12px] text-muted">{relTime(a.occurred_at)}</span>
                  </Row>
                ))}
              </div>
            ) : (
              <Empty>No activity logged yet.</Empty>
            )}
          </div>
        </Card>

        <Card title="Tasks" sub={`${dealTasks.filter((t) => t.status !== "done").length} open`}>
          {dealTasks.length ? (
            <div className="mb-5">
              {dealTasks.map((t) => (
                <Row key={t.id}>
                  <TaskCheck id={t.id} status={t.status} />
                  <span className={`min-w-0 flex-1 truncate text-[13.5px] ${t.status === "done" ? "text-muted line-through" : ""}`}>{t.title}</span>
                  <PriorityBadge p={t.priority} />
                  <span className="tabular w-16 shrink-0 text-right text-[12.5px] text-muted">{dateShort(t.due_on)}</span>
                </Row>
              ))}
            </div>
          ) : (
            <div className="mb-5"><Empty>No tasks on this deal.</Empty></div>
          )}
          <div className="border-t border-border-soft pt-4">
            <SectionLabel>Add a task</SectionLabel>
            <AddTaskForm fronts={fronts} recordType="deal" recordId={deal.id} compact />
          </div>
        </Card>
      </Grid>
    </>
  );
}
