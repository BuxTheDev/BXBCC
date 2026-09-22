import { getProperties, getUnits, getPortfolio, getEntities } from "@/lib/data";
import { usd, daysBetween, pct } from "@/lib/format";
import { Card, PageHeader, Stat, Empty, Badge } from "@/components/ui";
import { UnitBadge } from "@/components/crm/helpers";
import UnitStatusSelect from "@/components/crm/UnitStatusSelect";

export default async function PortfolioPage() {
  const [properties, units, portfolio, entities] = await Promise.all([getProperties(), getUnits(), getPortfolio(), getEntities()]);
  const occ = portfolio.total ? portfolio.occupied / portfolio.total : 0;
  const orphan = units.filter(u => !properties.some(p => p.id === u.property_id));

  return (
    <>
      <PageHeader title="Portfolio & units" sub={`${properties.length} properties · ${portfolio.total} units`} />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Occupancy" value={pct(occ)} tone={occ >= 0.9 ? "ok" : occ >= 0.75 ? "warn" : "bad"} sub={`${portfolio.occupied} of ${portfolio.total}`} />
        <Stat label="Occupied" value={portfolio.occupied} />
        <Stat label="Vacant" value={portfolio.vacant} tone={portfolio.vacant ? "warn" : undefined} />
        <Stat label="Turning" value={portfolio.turning} />
        <Stat label="In acquisition" value={portfolio.in_acquisition} />
      </div>

      {properties.length === 0 && <Empty>No properties yet.</Empty>}
      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map(p => {
          const us = units.filter(u => u.property_id === p.id);
          const entity = entities.find(e => e.id === p.entity_id);
          const addr = [p.city, p.state, p.zip].filter(Boolean).join(", ");
          return (
            <Card key={p.id} title={p.address1} action={<span className="text-xs text-muted">{entity?.name ?? ""}</span>}>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                {addr && <span>{addr}</span>}
                {p.income_class && <Badge tone="accent">{p.income_class}</Badge>}
                {p.use_tags?.map(t => <Badge key={t}>{t}</Badge>)}
                <span className="ml-auto tabular-nums">value {usd(p.current_value)} · debt {usd(p.debt_balance)}</span>
              </div>
              {us.length ? <UnitList units={us} /> : <Empty>No units.</Empty>}
            </Card>
          );
        })}
        {orphan.length > 0 && <Card title="Units without a property"><UnitList units={orphan} /></Card>}
      </div>
    </>
  );
}

function UnitList({ units }: { units: Awaited<ReturnType<typeof getUnits>> }) {
  return (
    <ul className="divide-y divide-border">
      {units.map(u => (
        <li key={u.id} className="flex items-center gap-3 py-2 text-sm">
          <div className="min-w-0 flex-1">
            <span className="font-medium">{u.name}</span>
            <span className="ml-2 text-xs text-muted">{u.kind}</span>
          </div>
          <UnitBadge s={u.status} />
          <span className="w-20 text-right tabular-nums text-muted">{u.target_rate != null ? usd(u.target_rate) : "—"}</span>
          <span className="w-24 text-right text-xs tabular-nums text-muted">
            {u.status === "vacant" && u.vacant_since ? <span className={daysBetween(u.vacant_since) > 7 ? "text-warn" : ""}>{daysBetween(u.vacant_since)}d vacant</span> : ""}
          </span>
          <UnitStatusSelect id={u.id} status={u.status} />
        </li>
      ))}
    </ul>
  );
}
