import Link from "next/link";
import { Search } from "lucide-react";
import { getContacts, getOrganizations } from "@/lib/data";
import { createContact } from "@/lib/actions";
import { dateShort } from "@/lib/format";
import { Avatar, Badge, Button, Card, Empty, PageHeader, Table, Tabs } from "@/components/ui";
import { Field } from "@/components/crm/helpers";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab = "people", q = "" } = await searchParams;
  const active = tab === "organizations" ? "organizations" : "people";
  const [contacts, orgs] = await Promise.all([getContacts(), getOrganizations()]);

  const needle = q.trim().toLowerCase();
  const rows = needle
    ? contacts.filter((c) => [c.full_name, c.email, c.phone].some((v) => (v ?? "").toLowerCase().includes(needle)))
    : contacts;
  const orgName = (id: string | null) => orgs.find((o) => o.id === id)?.name ?? null;
  const hrefFor = (k: string) => `/people?tab=${k}`;

  return (
    <>
      <PageHeader
        title="People"
        sub="Every contact and organization in the book"
        action={
          active === "people" ? (
            <form method="get" className="flex items-center gap-2">
              <input type="hidden" name="tab" value="people" />
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input name="q" defaultValue={q} placeholder="Search name, email, phone" className="w-72" style={{ paddingLeft: 32 }} />
              </div>
              <Button type="submit" variant="ghost">Search</Button>
            </form>
          ) : undefined
        }
      />

      <Tabs
        tabs={[
          { key: "people", label: "People", count: contacts.length },
          { key: "organizations", label: "Organizations", count: orgs.length },
        ]}
        active={active}
        hrefFor={hrefFor}
      />

      {active === "people" ? (
        <div className="space-y-4">
          <Card title="Contacts" sub={needle ? `${rows.length} of ${contacts.length} matching “${q}”` : `${contacts.length} total`}>
            {rows.length ? (
              <Table head={["Name", "Role", "Email", "Phone", "Organization", "Tags", "Created"]}>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={c.full_name || "?"} />
                        <span className="min-w-0">
                          <Link href={`/people/${c.id}`} className="font-medium hover:text-accent">
                            {c.full_name || "(unnamed)"}
                          </Link>
                          {c.dnc && <span className="ml-2 text-[11px] font-medium text-bad">DNC</span>}
                          {c.source && <span className="block text-[11.5px] text-muted">via {c.source}</span>}
                        </span>
                      </span>
                    </td>
                    <td>{c.role ? <Badge tone="accent">{c.role}</Badge> : <span className="text-muted">—</span>}</td>
                    <td className="text-fg-dim">{c.email ?? <span className="text-muted">—</span>}</td>
                    <td className="tabular text-fg-dim">{c.phone ?? <span className="text-muted">—</span>}</td>
                    <td className="text-fg-dim">{orgName(c.organization_id) ?? <span className="text-muted">—</span>}</td>
                    <td>
                      <span className="flex flex-wrap gap-1">
                        {c.tags?.length ? c.tags.map((t) => <Badge key={t}>{t}</Badge>) : <span className="text-muted">—</span>}
                      </span>
                    </td>
                    <td className="tabular whitespace-nowrap text-muted">{dateShort(c.created_at)}</td>
                  </tr>
                ))}
              </Table>
            ) : (
              <Empty>No contacts match that search.</Empty>
            )}
          </Card>

          <Card title="New contact" sub="Goes straight into the book">
            <form action={createContact} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-4">
                <Field label="First name"><input name="first_name" required /></Field>
                <Field label="Last name"><input name="last_name" /></Field>
                <Field label="Email"><input name="email" type="email" /></Field>
                <Field label="Phone"><input name="phone" /></Field>
                <Field label="Role"><input name="role" placeholder="seller, owner, agent…" /></Field>
                <Field label="Source"><input name="source" placeholder="salvo, referral…" /></Field>
                <Field label="Organization">
                  <select name="organization_id" defaultValue="">
                    <option value="">—</option>
                    {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </Field>
                <Field label="Tags (comma separated)"><input name="tags" placeholder="mtr, creative" /></Field>
                <Field label="Notes" className="md:col-span-4"><textarea name="notes" rows={2} /></Field>
              </div>
              <div className="flex justify-end"><Button type="submit">Add contact</Button></div>
            </form>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card title="Organizations" sub={`${orgs.length} total`}>
            {orgs.length ? (
              <Table head={["Name", "Kind", "Website", "Phone", "Contacts"]}>
                {orgs.map((o) => {
                  const n = contacts.filter((c) => c.organization_id === o.id).length;
                  return (
                    <tr key={o.id}>
                      <td className="font-medium">{o.name}</td>
                      <td>{o.kind ? <Badge>{o.kind}</Badge> : <span className="text-muted">—</span>}</td>
                      <td>
                        {o.website ? (
                          <a href={o.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                            {o.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="tabular text-fg-dim">{o.phone ?? <span className="text-muted">—</span>}</td>
                      <td className="tabular text-fg-dim">{n}</td>
                    </tr>
                  );
                })}
              </Table>
            ) : (
              <Empty>No organizations yet.</Empty>
            )}
            <div className="mt-4">
              <Empty>Add organizations directly in the database for now.</Empty>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
