import Link from "next/link";
import { getPipelines, getStages, getDeals, getContacts, getEntities, getFronts } from "@/lib/data";
import { createDeal } from "@/lib/actions";
import { usd, daysBetween, cn } from "@/lib/format";
import { Card, Badge, PageHeader, Button, Empty } from "@/components/ui";
import StageSelect from "@/components/crm/StageSelect";
import { Field } from "@/components/crm/helpers";

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ pipeline?: string }> }) {
  const { pipeline: slug } = await searchParams;
  const [pipelines, stages, deals, contacts, entities, fronts] = await Promise.all([
    getPipelines(), getStages(), getDeals(), getContacts(), getEntities(), getFronts(),
  ]);
  const current = pipelines.find(p => p.slug === slug) ?? pipelines[0];
  if (!current) return <><PageHeader title="Pipelines" /><Empty>No pipelines defined.</Empty></>;

  const cols = stages.filter(s => s.pipeline_id === current.id).sort((a, b) => a.sort - b.sort);
  const open = deals.filter(d => d.pipeline_id === current.id && d.status === "open");
  const contactName = (id: string | null) => contacts.find(c => c.id === id)?.full_name ?? null;
  const totalValue = open.reduce((s, d) => s + Number(d.value), 0);

  return (
    <>
      <PageHeader title="Pipelines" sub={`${open.length} open deals · ${usd(totalValue)} in ${current.name}`} />

      <nav className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {pipelines.map(p => (
          <Link key={p.id} href={`/deals?pipeline=${p.slug}`}
            className={cn("-mb-px border-b-2 px-3 py-2 text-sm", p.id === current.id ? "border-accent font-medium text-accent" : "border-transparent text-muted hover:text-fg")}>
            {p.name}
          </Link>
        ))}
      </nav>

      {cols.length === 0 ? <Empty>No stages in this pipeline.</Empty> : (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {cols.map(stage => {
              const ds = open.filter(d => d.stage_id === stage.id);
              const sum = ds.reduce((s, d) => s + Number(d.value), 0);
              return (
                <div key={stage.id} className="w-64 shrink-0 rounded-xl border border-border bg-surface-2/50 p-2">
                  <div className="mb-2 flex items-baseline justify-between px-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted">{stage.name}</div>
                    <div className="text-xs tabular-nums text-muted">{ds.length} · {usd(sum)}</div>
                  </div>
                  <div className="space-y-2">
                    {ds.map(d => {
                      const idle = daysBetween(d.last_activity_at);
                      return (
                        <div key={d.id} className="rounded-lg border border-border bg-surface p-2.5 text-sm">
                          <Link href={`/deals/${d.id}`} className="font-medium hover:text-accent">{d.title}</Link>
                          <div className="mt-0.5 tabular-nums">{usd(d.value)}</div>
                          {contactName(d.primary_contact_id) && <div className="text-xs text-muted">{contactName(d.primary_contact_id)}</div>}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <Badge tone={idle > 14 ? "warn" : "muted"}>{idle}d idle</Badge>
                            {d.source && <Badge>{d.source}</Badge>}
                          </div>
                          <StageSelect dealId={d.id} stageId={d.stage_id} stages={cols} />
                        </div>
                      );
                    })}
                    {ds.length === 0 && <div className="px-1 py-3 text-center text-xs text-muted">Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card title="New deal" className="mt-5">
        <form action={createDeal} className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <input type="hidden" name="pipeline_id" value={current.id} />
          <Field label="Title" className="col-span-2"><input name="title" required /></Field>
          <Field label="Stage">
            <select name="stage_id" defaultValue={cols[0]?.id ?? ""}>{cols.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </Field>
          <Field label="Value"><input type="number" name="value" min={0} step={1} defaultValue={0} /></Field>
          <Field label="Primary contact">
            <select name="primary_contact_id" defaultValue=""><option value="">—</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select>
          </Field>
          <Field label="Entity">
            <select name="entity_id" defaultValue=""><option value="">—</option>{entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          </Field>
          <Field label="Front">
            <select name="front_id" defaultValue=""><option value="">—</option>{fronts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
          </Field>
          <Field label="Expected close"><input type="date" name="expected_close" /></Field>
          <Field label="Source" className="col-span-2"><input name="source" placeholder="referral, cold call, web…" /></Field>
          <div className="col-span-2 flex items-end justify-end md:col-span-2"><Button type="submit">Create deal</Button></div>
        </form>
      </Card>
    </>
  );
}
