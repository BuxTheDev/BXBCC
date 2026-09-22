import { Card, PageHeader, Badge, Empty, Table, Stat } from "@/components/ui";
import { ClassBadge } from "@/components/life/helpers";
import { Expandable } from "@/components/life/Expandable";
import { PropertyForm, AssetForm } from "@/components/life/AssetForms";
import { getProperties, getAssets, getEntities } from "@/lib/data";
import { usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const [props, assets, entities] = await Promise.all([getProperties(), getAssets(), getEntities()]);
  const ename = (id: string | null) => (id && entities.find(e => e.id === id)?.name) || "—";
  const pv = props.reduce((s, p) => s + (p.current_value ?? 0), 0);
  const pd = props.reduce((s, p) => s + (p.debt_balance ?? 0), 0);
  const av = assets.reduce((s, a) => s + a.current_value, 0);
  const ad = assets.reduce((s, a) => s + a.debt_balance, 0);
  const total = "font-semibold [&_td]:!border-t-2 tabular-nums";

  return (
    <div className="space-y-5">
      <PageHeader title="Asset registry" sub="Everything held, what holds it, and the equity in it." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Gross value" value={usd(pv + av)} sub={`${props.length} properties, ${assets.length} other assets`} />
        <Stat label="Debt against assets" value={usd(pd + ad)} />
        <Stat label="Equity" value={usd(pv + av - pd - ad)} tone="ok" />
      </div>

      <Card title="Properties" action={<Expandable label="Add property"><div className="w-[min(80vw,900px)]"><PropertyForm entities={entities} /></div></Expandable>}>
        {props.length === 0 ? <Empty>No properties</Empty> : (
          <Table head={["Address", "City / State", "Entity", "Method", "Value", "Debt", "Equity", "Class", "Use"]}>
            {props.map(p => (
              <tr key={p.id}>
                <td className="font-medium">{p.address1}{p.notes && <div className="text-xs font-normal text-muted">{p.notes}</div>}</td>
                <td className="text-xs text-muted">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</td>
                <td className="text-xs">{ename(p.entity_id)}</td>
                <td className="text-xs text-muted">{p.acquisition_method ?? "—"}</td>
                <td className="tabular-nums">{usd(p.current_value)}</td>
                <td className="tabular-nums text-muted">{usd(p.debt_balance)}</td>
                <td className="tabular-nums">{usd((p.current_value ?? 0) - (p.debt_balance ?? 0))}</td>
                <td><ClassBadge c={p.income_class} /></td>
                <td className="space-x-1">{p.use_tags.map(t => <Badge key={t}>{t}</Badge>)}</td>
              </tr>
            ))}
            <tr className={total}><td>Total</td><td /><td /><td /><td>{usd(pv)}</td><td>{usd(pd)}</td><td>{usd(pv - pd)}</td><td /><td /></tr>
          </Table>
        )}
      </Card>

      <Card title="Other assets" action={<Expandable label="Add asset"><div className="w-[min(80vw,900px)]"><AssetForm entities={entities} /></div></Expandable>}>
        {assets.length === 0 ? <Empty>No other assets</Empty> : (
          <Table head={["Asset", "Kind", "Entity", "Method", "Value", "Debt", "Equity", "Class"]}>
            {assets.map(a => (
              <tr key={a.id}>
                <td className="font-medium">{a.name}{a.notes && <div className="text-xs font-normal text-muted">{a.notes}</div>}</td>
                <td className="text-xs text-muted">{a.kind}</td>
                <td className="text-xs">{ename(a.entity_id)}</td>
                <td className="text-xs text-muted">{a.acquisition_method ?? "—"}</td>
                <td className="tabular-nums">{usd(a.current_value)}</td>
                <td className="tabular-nums text-muted">{usd(a.debt_balance)}</td>
                <td className="tabular-nums">{usd(a.current_value - a.debt_balance)}</td>
                <td><ClassBadge c={a.income_class} /></td>
              </tr>
            ))}
            <tr className={total}><td>Total</td><td /><td /><td /><td>{usd(av)}</td><td>{usd(ad)}</td><td>{usd(av - ad)}</td><td /></tr>
          </Table>
        )}
      </Card>
    </div>
  );
}
