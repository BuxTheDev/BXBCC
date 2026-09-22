import { upsertAccount, createTransaction } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select, INCOME_OPTIONS, todayISO } from "@/components/life/helpers";
import type { Entity, Account } from "@/lib/types";

const cls = "grid gap-3 rounded-lg border border-border bg-surface-2/50 p-3 sm:grid-cols-2 lg:grid-cols-4";
const KINDS = ["checking", "savings", "brokerage", "retirement", "credit", "loan", "mortgage", "other"];

export function AccountForm({ account, entities }: { account?: Account; entities: Entity[] }) {
  return (
    <form action={upsertAccount} className={cls}>
      {account && <input type="hidden" name="id" value={account.id} />}
      <Field label="Name" className="sm:col-span-2"><input name="name" required defaultValue={account?.name ?? ""} /></Field>
      <Field label="Kind"><select name="kind" defaultValue={account?.kind ?? "checking"}>{KINDS.map(k => <option key={k} value={k}>{k}</option>)}</select></Field>
      <Field label="Entity"><Select name="entity_id" options={entities.map(e => ({ value: e.id, label: e.name }))} value={account?.entity_id} /></Field>
      <Field label="Institution"><input name="institution" defaultValue={account?.institution ?? ""} /></Field>
      <Field label="Last 4"><input name="last4" maxLength={4} defaultValue={account?.last4 ?? ""} /></Field>
      <Field label="Balance"><input name="balance" type="number" step="any" defaultValue={account?.balance ?? 0} /></Field>
      <Field label="Floor alert"><input name="floor_alert" type="number" step="any" defaultValue={account?.floor_alert ?? ""} /></Field>
      <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">{account ? "Save account" : "Add account"}</Button></div>
    </form>
  );
}

export function TransactionForm({ accounts, entities }: { accounts: Account[]; entities: Entity[] }) {
  return (
    <form action={createTransaction} className={cls}>
      <Field label="Account"><Select name="account_id" options={accounts.map(a => ({ value: a.id, label: a.name }))} required /></Field>
      <Field label="Posted on"><input name="posted_on" type="date" defaultValue={todayISO()} required /></Field>
      <Field label="Amount (negative = outflow)"><input name="amount" type="number" step="any" required /></Field>
      <Field label="Income class"><Select name="income_class" options={INCOME_OPTIONS} placeholder="Unclassified" /></Field>
      <Field label="Description" className="sm:col-span-2"><input name="description" /></Field>
      <Field label="Entity"><Select name="entity_id" options={entities.map(e => ({ value: e.id, label: e.name }))} /></Field>
      <Field label="Category"><input name="category" /></Field>
      <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">Add transaction</Button></div>
    </form>
  );
}
