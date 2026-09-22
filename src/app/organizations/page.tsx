import Link from "next/link";
import { getOrganizations, getContacts } from "@/lib/data";
import { Card, PageHeader, Badge, Empty, Table } from "@/components/ui";

export default async function OrganizationsPage() {
  const [orgs, contacts] = await Promise.all([getOrganizations(), getContacts()]);
  return (
    <>
      <PageHeader title="Organizations" sub={`${orgs.length} organizations`} />
      <Card>
        {orgs.length ? (
          <Table head={["Name", "Kind", "Phone", "Website", "Contacts"]}>
            {orgs.map(o => {
              const members = contacts.filter(c => c.organization_id === o.id);
              return (
                <tr key={o.id} className="align-top">
                  <td className="font-medium">{o.name}{o.notes && <div className="text-xs font-normal text-muted">{o.notes}</div>}</td>
                  <td>{o.kind ? <Badge>{o.kind}</Badge> : "—"}</td>
                  <td className="tabular-nums text-muted">{o.phone ?? "—"}</td>
                  <td className="text-muted">{o.website ? <a href={o.website} target="_blank" rel="noreferrer" className="hover:text-accent">{o.website}</a> : "—"}</td>
                  <td>
                    {members.length ? (
                      <ul className="space-y-0.5">
                        {members.map(c => (
                          <li key={c.id}><Link href={`/contacts/${c.id}`} className="hover:text-accent">{c.full_name}</Link>{c.role && <span className="ml-1 text-xs text-muted">{c.role}</span>}</li>
                        ))}
                      </ul>
                    ) : <span className="text-muted">—</span>}
                  </td>
                </tr>
              );
            })}
          </Table>
        ) : <Empty>No organizations yet.</Empty>}
      </Card>
      <div className="mt-5"><Empty>No create form yet — add organizations via the database for now.</Empty></div>
    </>
  );
}
