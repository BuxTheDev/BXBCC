import Link from "next/link";
import { notFound } from "next/navigation";
import { getContacts, getOrganizations, getDeals, getPipelines, getStages, getActivities } from "@/lib/data";
import { addActivity } from "@/lib/actions";
import { usd, dateShort, relTime } from "@/lib/format";
import { Avatar, Badge, Button, Card, Empty, Grid, Row, SectionLabel } from "@/components/ui";
import { Field, KV, ActivityBadge, DealStatusBadge } from "@/components/crm/helpers";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [contacts, orgs, deals, pipelines, stages, activities] = await Promise.all([
    getContacts(), getOrganizations(), getDeals(), getPipelines(), getStages(), getActivities(),
  ]);

  const c = contacts.find((x) => x.id === id);
  if (!c) notFound();

  const org = orgs.find((o) => o.id === c.organization_id);
  const theirDeals = deals.filter((d) => d.primary_contact_id === c.id);
  const acts = activities
    .filter((a) => a.contact_id === c.id || (a.record_type === "contact" && a.record_id === c.id))
    .sort((a, b) => +new Date(b.occurred_at) - +new Date(a.occurred_at));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Avatar name={c.full_name || "?"} />
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">{c.full_name || "(unnamed)"}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted">
            {c.role && <Badge tone="accent">{c.role}</Badge>}
            {org && <span>{org.name}</span>}
            {c.dnc && <Badge tone="bad">DNC</Badge>}
          </div>
        </div>
        <div className="ml-auto">
          <Link href="/people" className="text-[13px] text-muted hover:text-fg-dim">All people</Link>
        </div>
      </div>

      <Grid cols={3} className="mb-4">
        <Card title="Details">
          <KV k="Email" v={c.email ?? "—"} />
          <KV k="Phone" v={c.phone ?? "—"} />
          <KV k="Source" v={c.source ?? "—"} />
          <KV
            k="Tags"
            v={c.tags?.length ? <span className="flex flex-wrap justify-end gap-1">{c.tags.map((t) => <Badge key={t}>{t}</Badge>)}</span> : "—"}
          />
          <KV k="Organization" v={org?.name ?? "—"} />
          <KV k="Created" v={dateShort(c.created_at)} />
          {c.notes && (
            <div className="mt-4 border-t border-border-soft pt-3">
              <SectionLabel>Notes</SectionLabel>
              <p className="whitespace-pre-wrap text-[13.5px] text-fg-dim">{c.notes}</p>
            </div>
          )}
        </Card>

        <Card title="Deals" sub={`${theirDeals.length} where this person is primary`}>
          {theirDeals.length ? (
            <div>
              {theirDeals.map((d) => {
                const p = pipelines.find((x) => x.id === d.pipeline_id);
                const s = stages.find((x) => x.id === d.stage_id);
                return (
                  <Row key={d.id} className="items-start">
                    <span className="min-w-0 flex-1">
                      <Link href={`/deals/${d.id}`} className="block truncate text-[13.5px] font-medium hover:text-accent">
                        {d.title}
                      </Link>
                      <span className="mt-1 block truncate text-[12px] text-muted">
                        {p?.name ?? "Pipeline"} · {s?.name ?? "No stage"}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="tabular block text-[13.5px] font-semibold">{usd(d.value)}</span>
                      <span className="mt-1 block"><DealStatusBadge s={d.status} /></span>
                    </span>
                  </Row>
                );
              })}
            </div>
          ) : (
            <Empty>No deals on this contact.</Empty>
          )}
        </Card>

        <Card title="Log activity">
          <form action={addActivity} className="space-y-3">
            <input type="hidden" name="record_type" value="contact" />
            <input type="hidden" name="record_id" value={c.id} />
            <input type="hidden" name="contact_id" value={c.id} />
            <Field label="Kind">
              <select name="kind" defaultValue="note">
                {["note", "call", "sms", "email", "meeting"].map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Body"><textarea name="body" rows={4} required placeholder="What happened?" /></Field>
            <div className="flex justify-end"><Button type="submit">Log activity</Button></div>
          </form>
        </Card>
      </Grid>

      <Card title="Activity" sub={`${acts.length} entries, newest first`}>
        {acts.length ? (
          <div>
            {acts.map((a) => (
              <Row key={a.id} className="items-start">
                <span className="w-20 shrink-0"><ActivityBadge kind={a.kind} /></span>
                <span className="min-w-0 flex-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-fg-dim">
                  {a.body ?? "(no body)"}
                </span>
                <span className="tabular shrink-0 text-[12px] text-muted">{relTime(a.occurred_at)}</span>
              </Row>
            ))}
          </div>
        ) : (
          <Empty>Nothing logged yet.</Empty>
        )}
      </Card>
    </>
  );
}
