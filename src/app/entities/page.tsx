import { Card, PageHeader, Badge, Empty, Table } from "@/components/ui";
import { Expandable } from "@/components/life/Expandable";
import { EntityForm } from "@/components/life/EntityForm";
import { getEntities, getAccounts } from "@/lib/data";
import { usd, daysBetween, cn } from "@/lib/format";
import type { Entity, Account } from "@/lib/types";

export const dynamic = "force-dynamic";

const KIND_TONE: Record<Entity["kind"], "muted" | "accent" | "ok" | "warn" | "bad"> = { holdco: "accent", propco: "ok", opco: "warn", nonprofit: "muted", personal: "muted", other: "muted" };

function Node({ e, all, depth }: { e: Entity; all: Entity[]; depth: number }) {
  const kids = all.filter(k => k.parent_id === e.id);
  const days = e.annual_filing_due ? -daysBetween(e.annual_filing_due) : null;
  const soon = days != null && days < 30;
  return (
    <div className={cn(depth > 0 && "ml-5 border-l-2 border-border pl-4")}>
      <div className="my-2 rounded-lg border border-border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{e.name}</span>
          <Badge tone={KIND_TONE[e.kind]}>{e.kind}</Badge>
          {e.jurisdiction && <span className="text-xs text-muted">{e.jurisdiction}</span>}
          <span className="text-xs tabular-nums text-muted">{e.ownership_pct}% owned</span>
          {e.annual_filing_due && (
            <span className={cn("text-xs tabular-nums", soon ? "font-medium text-warn" : "text-muted")}>
              filing due {e.annual_filing_due}{days != null && ` (${days < 0 ? `${-days}d overdue` : `${days}d`})`}
            </span>
          )}
        </div>
        {(e.ein || e.formed_on || e.registered_agent) && (
          <div className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-muted">
            {e.ein && <span>EIN {e.ein}</span>}{e.formed_on && <span>formed {e.formed_on}</span>}{e.registered_agent && <span>RA {e.registered_agent}</span>}
          </div>
        )}
        {e.notes && <div className="mt-1 text-xs text-muted">{e.notes}</div>}
        <div className="mt-2"><Expandable label="Edit"><EntityForm entity={e} entities={all} /></Expandable></div>
      </div>
      {kids.map(k => <Node key={k.id} e={k} all={all} depth={depth + 1} />)}
    </div>
  );
}

export default async function EntitiesPage() {
  const [entities, accounts] = await Promise.all([getEntities(), getAccounts()]);
  const ids = new Set(entities.map(e => e.id));
  const roots = entities.filter(e => !e.parent_id || !ids.has(e.parent_id));
  const byEntity = new Map<string, Account[]>();
  for (const a of accounts) { const k = a.entity_id ?? ""; if (!byEntity.has(k)) byEntity.set(k, []); byEntity.get(k)!.push(a); }
  const name = (id: string) => entities.find(e => e.id === id)?.name ?? "Unassigned";

  return (
    <div className="space-y-5">
      <PageHeader title="Entity map" sub={`${entities.length} entities. Ownership tree, filings, and the accounts each one holds.`} />
      <Card title="Structure">
        {roots.length === 0 ? <Empty>No entities yet</Empty> : roots.map(e => <Node key={e.id} e={e} all={entities} depth={0} />)}
      </Card>
      <Card title="Accounts by entity">
        {accounts.length === 0 ? <Empty>No accounts</Empty> : (
          <Table head={["Entity", "Account", "Kind", "Institution", "Balance"]}>
            {[...byEntity.entries()].sort((a, b) => name(a[0]).localeCompare(name(b[0]))).flatMap(([eid, list]) =>
              list.map((a, i) => (
                <tr key={a.id}>
                  <td className="text-xs font-medium">{i === 0 ? name(eid) : ""}</td>
                  <td>{a.name}{a.last4 && <span className="ml-1 text-xs text-muted">··{a.last4}</span>}</td>
                  <td className="text-xs text-muted">{a.kind}</td>
                  <td className="text-xs text-muted">{a.institution ?? "—"}</td>
                  <td className={cn("tabular-nums", a.is_liability && "text-bad")}>{a.is_liability ? "−" : ""}{usd(a.balance)}</td>
                </tr>
              )))}
          </Table>
        )}
      </Card>
      <Card title="Add entity"><EntityForm entities={entities} /></Card>
    </div>
  );
}
