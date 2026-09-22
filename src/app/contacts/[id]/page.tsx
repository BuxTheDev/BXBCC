import Link from "next/link";
import { notFound } from "next/navigation";
import { getContacts, getOrganizations, getDeals, getPipelines, getStages, getActivities } from "@/lib/data";
import { usd, dateShort, daysBetween } from "@/lib/format";
import { Card, PageHeader, Badge, Empty, Table } from "@/components/ui";
import { KV, DealStatusBadge, ActivityList } from "@/components/crm/helpers";
import AddActivityForm from "@/components/crm/AddActivityForm";

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [contacts, orgs, deals, pipelines, stages, activities] = await Promise.all([
    getContacts(), getOrganizations(), getDeals(), getPipelines(), getStages(), getActivities(),
  ]);
  const c = contacts.find(x => x.id === id);
  if (!c) notFound();
  const org = orgs.find(o => o.id === c.organization_id);
  const myDeals = deals.filter(d => d.primary_contact_id === c.id);
  const acts = activities.filter(a => a.contact_id === c.id || (a.record_type === "contact" && a.record_id === c.id))
    .sort((a, b) => +new Date(b.occurred_at) - +new Date(a.occurred_at));

  return (
    <>
      <PageHeader title={c.full_name || "(unnamed)"} sub={<span className="flex flex-wrap items-center gap-2">
        {c.role && <Badge tone="accent">{c.role}</Badge>}
        {c.dnc && <Badge tone="bad">Do not contact</Badge>}
        {c.tags?.map(t => <Badge key={t}>{t}</Badge>)}
        <span>· added {dateShort(c.created_at)}</span>
      </span>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card title="Details">
            <KV k="Email" v={c.email ? <a href={`mailto:${c.email}`} className="hover:text-accent">{c.email}</a> : null} />
            <KV k="Phone" v={c.phone ? <a href={`tel:${c.phone}`} className="hover:text-accent">{c.phone}</a> : null} />
            <KV k="Organization" v={org ? <Link href="/organizations" className="hover:text-accent">{org.name}</Link> : null} />
            <KV k="Source" v={c.source} />
          </Card>
          {c.notes && <Card title="Notes"><p className="whitespace-pre-wrap text-sm">{c.notes}</p></Card>}
          {org && (
            <Card title="Organization">
              <KV k="Name" v={org.name} />
              <KV k="Kind" v={org.kind} />
              <KV k="Phone" v={org.phone} />
              <KV k="Website" v={org.website ? <a href={org.website} target="_blank" rel="noreferrer" className="hover:text-accent">{org.website}</a> : null} />
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card title="Deals">
            {myDeals.length ? (
              <Table head={["Deal", "Pipeline / stage", "Status", "Value", "Last activity"]}>
                {myDeals.map(d => (
                  <tr key={d.id}>
                    <td><Link href={`/deals/${d.id}`} className="font-medium hover:text-accent">{d.title}</Link></td>
                    <td className="text-muted">{pipelines.find(p => p.id === d.pipeline_id)?.name ?? "—"} / {stages.find(s => s.id === d.stage_id)?.name ?? "—"}</td>
                    <td><DealStatusBadge s={d.status} /></td>
                    <td className="tabular-nums">{usd(d.value)}</td>
                    <td className="tabular-nums text-muted">{daysBetween(d.last_activity_at)}d ago</td>
                  </tr>
                ))}
              </Table>
            ) : <Empty>No deals with this contact as primary.</Empty>}
          </Card>
          <Card title="Activity">
            <AddActivityForm recordType="contact" recordId={c.id} contactId={c.id} />
            <div className="mt-4">{acts.length ? <ActivityList items={acts} /> : <Empty>No activity logged yet.</Empty>}</div>
          </Card>
        </div>
      </div>
    </>
  );
}
