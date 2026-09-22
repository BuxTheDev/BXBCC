import Link from "next/link";
import { getContacts, getOrganizations } from "@/lib/data";
import { createContact } from "@/lib/actions";
import { dateShort } from "@/lib/format";
import { Card, PageHeader, Badge, Button, Empty, Table } from "@/components/ui";
import { Field } from "@/components/crm/helpers";

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [contacts, orgs] = await Promise.all([getContacts(), getOrganizations()]);
  const needle = q.trim().toLowerCase();
  const rows = needle
    ? contacts.filter(c => [c.full_name, c.email, c.phone].some(v => (v ?? "").toLowerCase().includes(needle)))
    : contacts;
  const orgName = (id: string | null) => orgs.find(o => o.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader title="Contacts" sub={`${rows.length} of ${contacts.length}`} action={
        <form method="get" className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search name, email, phone" className="w-64" />
          <Button type="submit" variant="ghost">Search</Button>
        </form>
      } />

      <Card>
        {rows.length ? (
          <Table head={["Name", "Role", "Email", "Phone", "Organization", "Tags", "Source", "Created"]}>
            {rows.map(c => (
              <tr key={c.id}>
                <td><Link href={`/contacts/${c.id}`} className="font-medium hover:text-accent">{c.full_name || "(unnamed)"}</Link>{c.dnc && <span className="ml-2 text-[11px] text-bad">DNC</span>}</td>
                <td>{c.role ? <Badge tone="accent">{c.role}</Badge> : "—"}</td>
                <td className="text-muted">{c.email ?? "—"}</td>
                <td className="tabular-nums text-muted">{c.phone ?? "—"}</td>
                <td>{orgName(c.organization_id)}</td>
                <td><span className="flex flex-wrap gap-1">{c.tags?.map(t => <Badge key={t}>{t}</Badge>)}</span></td>
                <td className="text-muted">{c.source ?? "—"}</td>
                <td className="tabular-nums text-muted">{dateShort(c.created_at)}</td>
              </tr>
            ))}
          </Table>
        ) : <Empty>{needle ? `No contacts match "${q}".` : "No contacts yet."}</Empty>}
      </Card>

      <Card title="New contact" className="mt-5">
        <form action={createContact} className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Field label="First name"><input name="first_name" required /></Field>
          <Field label="Last name"><input name="last_name" /></Field>
          <Field label="Email"><input type="email" name="email" /></Field>
          <Field label="Phone"><input name="phone" /></Field>
          <Field label="Role"><input name="role" placeholder="seller, buyer, lender, vendor…" /></Field>
          <Field label="Source"><input name="source" /></Field>
          <Field label="Organization">
            <select name="organization_id" defaultValue=""><option value="">—</option>{orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
          </Field>
          <Field label="Tags (comma separated)"><input name="tags" /></Field>
          <Field label="Notes" className="col-span-2 md:col-span-3"><input name="notes" /></Field>
          <div className="flex items-end justify-end"><Button type="submit">Create contact</Button></div>
        </form>
      </Card>
    </>
  );
}
