import { Card, PageHeader, Badge, Empty, Table, Stat } from "@/components/ui";
import { ClassBadge } from "@/components/life/helpers";
import { Expandable } from "@/components/life/Expandable";
import { AccountForm, TransactionForm } from "@/components/life/MoneyForms";
import { getAccounts, getEntities, getTransactions, getIncomeByClassT12, getNetWorth } from "@/lib/data";
import { usd, pct, cn } from "@/lib/format";
import { INCOME_CLASS_LABEL, type IncomeClass } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MoneyPage() {
  const [accounts, entities, tx, t12, nw] = await Promise.all([getAccounts(), getEntities(), getTransactions(), getIncomeByClassT12(), getNetWorth()]);
  const ename = (id: string | null) => (id && entities.find(e => e.id === id)?.name) || "—";
  const aname = (id: string | null) => (id && accounts.find(a => a.id === id)?.name) || "—";
  const t12Total = Object.values(t12).reduce((a, b) => a + b, 0);
  const classes = ["SI", "LI", "BOI", "ABI", "KBI"] as IncomeClass[];
  const recent = [...tx].sort((a, b) => b.posted_on.localeCompare(a.posted_on)).slice(0, 30);
  const assetsTotal = accounts.filter(a => !a.is_liability).reduce((s, a) => s + a.balance, 0);
  const liabTotal = accounts.filter(a => a.is_liability).reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Money" sub="Accounts, income by class, and the ledger." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Liquid cash" value={usd(nw.liquid_cash)} sub="checking + savings" />
        <Stat label="Account assets" value={usd(assetsTotal)} />
        <Stat label="Account liabilities" value={usd(liabTotal)} tone={liabTotal > 0 ? "warn" : undefined} />
      </div>

      <Card title="Accounts" action={<Expandable label="Add account"><div className="w-[min(80vw,900px)]"><AccountForm entities={entities} /></div></Expandable>}>
        {accounts.length === 0 ? <Empty>No accounts</Empty> : (
          <Table head={["Account", "Entity", "Kind", "Institution", "Balance", "Floor", ""]}>
            {accounts.map(a => {
              const below = a.floor_alert != null && !a.is_liability && a.balance < a.floor_alert;
              return (
                <tr key={a.id}>
                  <td className="font-medium">{a.name}{a.last4 && <span className="ml-1 text-xs font-normal text-muted">··{a.last4}</span>}</td>
                  <td className="text-xs">{ename(a.entity_id)}</td>
                  <td className="text-xs text-muted">{a.kind}{a.is_liability && <Badge tone="bad">liability</Badge>}</td>
                  <td className="text-xs text-muted">{a.institution ?? "—"}</td>
                  <td className={cn("tabular-nums", a.is_liability && "text-bad", below && "text-warn")}>{a.is_liability ? "−" : ""}{usd(a.balance)}</td>
                  <td className={cn("text-xs tabular-nums", below ? "text-warn" : "text-muted")}>{a.floor_alert != null ? usd(a.floor_alert) : "—"}</td>
                  <td className="text-right"><Expandable label="Edit"><div className="w-[min(80vw,900px)] text-left"><AccountForm account={a} entities={entities} /></div></Expandable></td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <Card title="Income by class, trailing 12 months">
        <Table head={["Class", "Meaning", "T12 income", "Share"]}>
          {classes.map(c => (
            <tr key={c}>
              <td><ClassBadge c={c} /></td>
              <td className="text-xs text-muted">{INCOME_CLASS_LABEL[c]}</td>
              <td className="tabular-nums">{usd(t12[c])}</td>
              <td className="tabular-nums">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2"><div className="h-full" style={{ width: `${t12Total ? (t12[c] / t12Total) * 100 : 0}%`, background: `var(--c-${c.toLowerCase()})` }} /></div>
                  <span>{t12Total ? pct(t12[c] / t12Total) : "0%"}</span>
                </div>
              </td>
            </tr>
          ))}
          <tr className="font-semibold [&_td]:!border-t-2"><td>Total</td><td /><td className="tabular-nums">{usd(t12Total)}</td><td /></tr>
        </Table>
      </Card>

      <Card title="Recent transactions" action={<span className="text-xs text-muted">last {recent.length}</span>}>
        {recent.length === 0 ? <Empty>No transactions</Empty> : (
          <Table head={["Date", "Description", "Account", "Entity", "Class", "Amount"]}>
            {recent.map(t => (
              <tr key={t.id}>
                <td className="text-xs tabular-nums text-muted">{t.posted_on}</td>
                <td>{t.description ?? "—"}{t.category && <span className="ml-1 text-xs text-muted">{t.category}</span>}</td>
                <td className="text-xs">{aname(t.account_id)}</td>
                <td className="text-xs">{ename(t.entity_id)}</td>
                <td><ClassBadge c={t.income_class} /></td>
                <td className={cn("text-right tabular-nums", t.amount < 0 ? "text-bad" : "text-ok")}>{t.amount < 0 ? "−" : "+"}{usd(Math.abs(t.amount))}</td>
              </tr>
            ))}
          </Table>
        )}
        <div className="mt-4"><TransactionForm accounts={accounts} entities={entities} /></div>
      </Card>
    </div>
  );
}
