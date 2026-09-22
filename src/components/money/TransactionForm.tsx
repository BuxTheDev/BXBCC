import { createTransaction } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select, FormGrid, INCOME_OPTIONS, entityOptions, todayISO } from "@/components/money/fields";
import type { Account, Entity } from "@/lib/types";

export default function TransactionForm({ accounts, entities }: { accounts: Account[]; entities: Entity[] }) {
  return (
    <form action={createTransaction} className="space-y-4">
      <FormGrid>
        <Field label="Account">
          <Select
            name="account_id"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="Unassigned"
          />
        </Field>
        <Field label="Posted on">
          <input name="posted_on" type="date" defaultValue={todayISO()} />
        </Field>
        <Field label="Amount">
          <input name="amount" type="number" step="any" required placeholder="2500" />
        </Field>
        <Field label="Income class">
          <Select name="income_class" options={INCOME_OPTIONS} placeholder="Unclassified" />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <input name="description" placeholder="MTR rent — Whole unit" />
        </Field>
        <Field label="Entity">
          <Select name="entity_id" options={entityOptions(entities)} placeholder="Unassigned" />
        </Field>
        <Field label="Category">
          <input name="category" placeholder="rent" />
        </Field>
      </FormGrid>
      <Button type="submit">Add transaction</Button>
    </form>
  );
}
