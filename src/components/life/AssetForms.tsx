import { upsertProperty, upsertAsset } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select, INCOME_OPTIONS } from "@/components/life/helpers";
import type { Entity } from "@/lib/types";

const cls = "grid gap-3 rounded-lg border border-border bg-surface-2/50 p-3 sm:grid-cols-2 lg:grid-cols-4";

export function PropertyForm({ entities }: { entities: Entity[] }) {
  return (
    <form action={upsertProperty} className={cls}>
      <Field label="Address" className="sm:col-span-2"><input name="address1" required /></Field>
      <Field label="City"><input name="city" /></Field>
      <div className="grid grid-cols-2 gap-2"><Field label="State"><input name="state" /></Field><Field label="Zip"><input name="zip" /></Field></div>
      <Field label="Holding entity"><Select name="entity_id" options={entities.map(e => ({ value: e.id, label: e.name }))} /></Field>
      <Field label="Acquisition method"><input name="acquisition_method" placeholder="conventional, seller finance, sub-to" /></Field>
      <Field label="Acquired on"><input name="acquired_on" type="date" /></Field>
      <Field label="Income class"><Select name="income_class" options={INCOME_OPTIONS} /></Field>
      <Field label="Basis"><input name="basis" type="number" step="any" /></Field>
      <Field label="Current value"><input name="current_value" type="number" step="any" /></Field>
      <Field label="Debt balance"><input name="debt_balance" type="number" step="any" defaultValue={0} /></Field>
      <Field label="Use tags (comma separated)"><input name="use_tags" placeholder="MTR, house-hack" /></Field>
      <Field label="Notes" className="sm:col-span-2 lg:col-span-4"><input name="notes" /></Field>
      <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">Add property</Button></div>
    </form>
  );
}

export function AssetForm({ entities }: { entities: Entity[] }) {
  return (
    <form action={upsertAsset} className={cls}>
      <Field label="Name" className="sm:col-span-2"><input name="name" required /></Field>
      <Field label="Kind"><input name="kind" placeholder="vehicle, equity, equipment" /></Field>
      <Field label="Holding entity"><Select name="entity_id" options={entities.map(e => ({ value: e.id, label: e.name }))} /></Field>
      <Field label="Acquisition method"><input name="acquisition_method" /></Field>
      <Field label="Income class"><Select name="income_class" options={INCOME_OPTIONS} /></Field>
      <Field label="Basis"><input name="basis" type="number" step="any" /></Field>
      <Field label="Current value"><input name="current_value" type="number" step="any" required /></Field>
      <Field label="Debt balance"><input name="debt_balance" type="number" step="any" defaultValue={0} /></Field>
      <Field label="Notes" className="sm:col-span-2 lg:col-span-3"><input name="notes" /></Field>
      <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">Add asset</Button></div>
    </form>
  );
}
