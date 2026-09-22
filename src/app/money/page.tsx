import { PageHeader, Tabs, Card, Table, Badge, ClassBadge, Empty, Stat } from "@/components/ui";
import { PositionStats, IncomeMixCard, IncomeByClassCard } from "@/components/money/Position";
import GoalsTree from "@/components/money/GoalsTree";
import EntityTree from "@/components/money/EntityTree";
import EntityEditor from "@/components/money/EntityEditor";
import AccountEditor from "@/components/money/AccountEditor";
import GoalEditor from "@/components/money/GoalEditor";
import TransactionForm from "@/components/money/TransactionForm";
import { PropertyForm, AssetForm } from "@/components/money/AssetForms";
import {
  getEntities, getAccounts, getProperties, getAssets, getTransactions, getGoals, getNetWorth,
} from "@/lib/data";
import { usd, cn } from "@/lib/format";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "position", label: "Position" },
  { key: "entities", label: "Entities" },
  { key: "assets", label: "Assets" },
  { key: "accounts", label: "Accounts" },
  { key: "transactions", label: "Transactions" },
  { key: "goals", label: "Goals" },
];

const hrefFor = (k: string) => `/money?tab=${k}`;

/* ------------------------------------------------------------- position */

function PositionTab() {
  return (
    <div className="space-y-4">
      <PositionStats />
      <IncomeMixCard />
      <IncomeByClassCard />
    </div>
  );
}

/* ------------------------------------------------------------- entities */

async function EntitiesTab() {
  const entities = await getEntities();
  return (
    <div className="space-y-4">
      <Card title="Ownership structure" sub={`${entities.length} entities, nested by parent`}>
        <EntityTree entities={entities} />
      </Card>
      <Card title="Add / edit entity" sub="Pick one to edit, or leave the picker on “New entity”">
        <EntityEditor entities={entities} />
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------- assets */

async function AssetsTab() {
  const [properties, assets, entities] = await Promise.all([getProperties(), getAssets(), getEntities()]);
  const ename = (id: string | null) => (id && entities.find((e) => e.id === id)?.name) || "—";

  const pValue = properties.reduce((s, p) => s + Number(p.current_value ?? 0), 0);
  const pDebt = properties.reduce((s, p) => s + Number(p.debt_balance ?? 0), 0);
  const aValue = assets.reduce((s, a) => s + Number(a.current_value ?? 0), 0);
  const aDebt = assets.reduce((s, a) => s + Number(a.debt_balance ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Property value" value={usd(pValue)} sub={`${properties.length} properties`} />
        <Stat label="Property equity" value={usd(pValue - pDebt)} sub={`${usd(pDebt)} of debt`} tone="ok" />
        <Stat label="Other asset value" value={usd(aValue)} sub={`${assets.length} assets`} />
        <Stat label="Total equity" value={usd(pValue - pDebt + aValue - aDebt)} />
      </div>

      <Card title="Properties" sub="Real estate held across the structure">
        {properties.length === 0 ? (
          <Empty>No properties yet.</Empty>
        ) : (
          <Table head={["Address", "City / state", "Entity", "Method", "Value", "Debt", "Equity", "Class", "Use"]}>
            {properties.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.address1}</td>
                <td className="text-[13px] text-muted">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</td>
                <td className="text-[13px]">{ename(p.entity_id)}</td>
                <td className="text-[13px] text-muted">{p.acquisition_method ?? "—"}</td>
                <td className="tabular">{usd(p.current_value)}</td>
                <td className="tabular text-fg-dim">{usd(p.debt_balance)}</td>
                <td className="tabular">{usd(Number(p.current_value ?? 0) - Number(p.debt_balance ?? 0))}</td>
                <td><ClassBadge c={p.income_class} /></td>
                <td>
                  <span className="flex flex-wrap gap-1">
                    {(p.use_tags ?? []).map((t) => (
                      <Badge key={t} tone="outline">{t}</Badge>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="font-semibold [&_td]:!border-t-2 [&_td]:!border-border">
              <td>Total</td>
              <td /><td /><td />
              <td className="tabular">{usd(pValue)}</td>
              <td className="tabular">{usd(pDebt)}</td>
              <td className="tabular">{usd(pValue - pDebt)}</td>
              <td /><td />
            </tr>
          </Table>
        )}
      </Card>

      <Card title="Other assets" sub="Everything that is not real estate">
        {assets.length === 0 ? (
          <Empty>No other assets yet.</Empty>
        ) : (
          <Table head={["Asset", "Kind", "Entity", "Method", "Value", "Debt", "Equity", "Class"]}>
            {assets.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.name}</td>
                <td className="text-[13px] text-muted">{a.kind}</td>
                <td className="text-[13px]">{ename(a.entity_id)}</td>
                <td className="text-[13px] text-muted">{a.acquisition_method ?? "—"}</td>
                <td className="tabular">{usd(a.current_value)}</td>
                <td className="tabular text-fg-dim">{usd(a.debt_balance)}</td>
                <td className="tabular">{usd(Number(a.current_value) - Number(a.debt_balance))}</td>
                <td><ClassBadge c={a.income_class} /></td>
              </tr>
            ))}
            <tr className="font-semibold [&_td]:!border-t-2 [&_td]:!border-border">
              <td>Total</td>
              <td /><td /><td />
              <td className="tabular">{usd(aValue)}</td>
              <td className="tabular">{usd(aDebt)}</td>
              <td className="tabular">{usd(aValue - aDebt)}</td>
              <td />
            </tr>
          </Table>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Add property"><PropertyForm entities={entities} /></Card>
        <Card title="Add asset"><AssetForm entities={entities} /></Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- accounts */

async function AccountsTab() {
  const [accounts, entities] = await Promise.all([getAccounts(), getEntities()]);
  const ename = (id: string | null) => (id && entities.find((e) => e.id === id)?.name) || "—";
  const cash = accounts.filter((a) => !a.is_liability).reduce((s, a) => s + Number(a.balance), 0);
  const owed = accounts.filter((a) => a.is_liability).reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Account assets" value={usd(cash)} sub={`${accounts.filter((a) => !a.is_liability).length} accounts`} />
        <Stat label="Account liabilities" value={usd(owed)} tone={owed > 0 ? "warn" : undefined} />
        <Stat label="Net" value={usd(cash - owed)} tone={cash - owed >= 0 ? "ok" : "bad"} />
      </div>

      <Card title="Accounts" sub="Balances as last recorded">
        {accounts.length === 0 ? (
          <Empty>No accounts yet.</Empty>
        ) : (
          <Table head={["Account", "Entity", "Kind", "Institution", "Balance", "Floor"]}>
            {accounts.map((a) => {
              const below = a.floor_alert != null && !a.is_liability && Number(a.balance) < Number(a.floor_alert);
              return (
                <tr key={a.id}>
                  <td className="font-medium">
                    {a.name}
                    {a.last4 && <span className="ml-1.5 text-[11px] font-normal text-muted">··{a.last4}</span>}
                  </td>
                  <td className="text-[13px]">{ename(a.entity_id)}</td>
                  <td><Badge tone={a.is_liability ? "bad" : "muted"}>{a.kind}</Badge></td>
                  <td className="text-[13px] text-muted">{a.institution ?? "—"}</td>
                  <td className={cn("tabular", a.is_liability ? "text-bad" : below ? "text-warn" : "")}>
                    {a.is_liability ? "−" : ""}
                    {usd(a.balance)}
                  </td>
                  <td className={cn("tabular text-[13px]", below ? "text-warn" : "text-muted")}>
                    {a.floor_alert != null ? usd(a.floor_alert) : "—"}
                  </td>
                </tr>
              );
            })}
            <tr className="font-semibold [&_td]:!border-t-2 [&_td]:!border-border">
              <td>Net</td>
              <td /><td /><td />
              <td className={cn("tabular", cash - owed >= 0 ? "text-ok" : "text-bad")}>{usd(cash - owed)}</td>
              <td />
            </tr>
          </Table>
        )}
      </Card>

      <Card title="Add / edit account" sub="Pick one to edit, or leave the picker on “New account”">
        <AccountEditor accounts={accounts} entities={entities} />
      </Card>
    </div>
  );
}

/* --------------------------------------------------------- transactions */

async function TransactionsTab() {
  const [tx, accounts, entities] = await Promise.all([getTransactions(), getAccounts(), getEntities()]);
  const ename = (id: string | null) => (id && entities.find((e) => e.id === id)?.name) || "—";
  const aname = (id: string | null) => (id && accounts.find((a) => a.id === id)?.name) || "—";
  const recent = [...tx].sort((a, b) => b.posted_on.localeCompare(a.posted_on)).slice(0, 40);

  return (
    <div className="space-y-4">
      <Card title="Ledger" sub={`Last ${recent.length} transactions`}>
        {recent.length === 0 ? (
          <Empty>No transactions yet.</Empty>
        ) : (
          <Table head={["Date", "Description", "Account", "Entity", "Class", <span key="a" className="block text-right">Amount</span>]}>
            {recent.map((t) => (
              <tr key={t.id}>
                <td className="tabular text-[13px] text-muted">{t.posted_on}</td>
                <td>
                  {t.description ?? "—"}
                  {t.category && <span className="ml-1.5 text-[11px] text-muted">{t.category}</span>}
                </td>
                <td className="text-[13px]">{aname(t.account_id)}</td>
                <td className="text-[13px]">{ename(t.entity_id)}</td>
                <td><ClassBadge c={t.income_class} /></td>
                <td className={cn("tabular text-right", Number(t.amount) > 0 ? "text-ok" : "text-fg-dim")}>
                  {Number(t.amount) > 0 ? "+" : "−"}
                  {usd(Math.abs(Number(t.amount)))}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="Add transaction">
        <TransactionForm accounts={accounts} entities={entities} />
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- goals */

async function GoalsTab() {
  const [goals, nw] = await Promise.all([getGoals(), getNetWorth()]);
  return (
    <div className="space-y-4">
      <Card title="Goals" sub="Nested by parent; net-worth goals track the live number">
        <GoalsTree goals={goals} overrides={{ net_worth: nw.net_worth }} />
      </Card>
      <Card title="Add / edit goal" sub="Pick one to edit, or leave the picker on “New goal”">
        <GoalEditor goals={goals} />
      </Card>
    </div>
  );
}

/* ----------------------------------------------------------------- page */

export default async function MoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tab } = await searchParams;
  const key = typeof tab === "string" && TABS.some((t) => t.key === tab) ? tab : "position";

  return (
    <div>
      <PageHeader
        eyebrow="Command center"
        title="Money"
        sub="Net worth, entities and where the income comes from"
      />
      <Tabs tabs={TABS} active={key} hrefFor={hrefFor} />
      {key === "entities" ? (
        <EntitiesTab />
      ) : key === "assets" ? (
        <AssetsTab />
      ) : key === "accounts" ? (
        <AccountsTab />
      ) : key === "transactions" ? (
        <TransactionsTab />
      ) : key === "goals" ? (
        <GoalsTab />
      ) : (
        <PositionTab />
      )}
    </div>
  );
}
