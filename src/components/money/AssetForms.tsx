import { upsertProperty, upsertAsset } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select, FormGrid, INCOME_OPTIONS, entityOptions } from "@/components/money/fields";
import type { Entity } from "@/lib/types";

const METHODS = ["cash", "conventional", "seller_finance", "subject_to", "hard_money", "brrrr", "built", "other"];

export function PropertyForm({ entities }: { entities: Entity[] }) {
  return (
    <form action={upsertProperty} className="space-y-4">
      <FormGrid>
        <Field label="Address" className="sm:col-span-2">
          <input name="address1" required placeholder="1234 W Palm Ln" />
        </Field>
        <Field label="City">
          <input name="city" />
        </Field>
        <Field label="State">
          <input name="state" placeholder="AZ" maxLength={2} />
        </Field>
        <Field label="ZIP">
          <input name="zip" />
        </Field>
        <Field label="Entity">
          <Select name="entity_id" options={entityOptions(entities)} placeholder="Unassigned" />
        </Field>
        <Field label="Acquisition method">
          <Select name="acquisition_method" options={METHODS.map((m) => ({ value: m, label: m }))} placeholder="—" />
        </Field>
        <Field label="Acquired on">
          <input name="acquired_on" type="date" />
        </Field>
        <Field label="Basis">
          <input name="basis" type="number" step="any" />
        </Field>
        <Field label="Current value">
          <input name="current_value" type="number" step="any" />
        </Field>
        <Field label="Debt balance">
          <input name="debt_balance" type="number" step="any" defaultValue={0} />
        </Field>
        <Field label="Income class">
          <Select name="income_class" options={INCOME_OPTIONS} placeholder="—" />
        </Field>
        <Field label="Use tags" className="sm:col-span-2">
          <input name="use_tags" placeholder="cozii, terralift" />
        </Field>
        <Field label="Notes" className="sm:col-span-2 xl:col-span-4">
          <input name="notes" />
        </Field>
      </FormGrid>
      <Button type="submit">Add property</Button>
    </form>
  );
}

const ASSET_KINDS = ["equipment", "vehicle", "digital_product", "security", "note", "crypto", "other"];

export function AssetForm({ entities }: { entities: Entity[] }) {
  return (
    <form action={upsertAsset} className="space-y-4">
      <FormGrid>
        <Field label="Name" className="sm:col-span-2">
          <input name="name" required placeholder="GPU rig" />
        </Field>
        <Field label="Kind">
          <select name="kind" defaultValue="other">
            {ASSET_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Entity">
          <Select name="entity_id" options={entityOptions(entities)} placeholder="Unassigned" />
        </Field>
        <Field label="Acquisition method">
          <Select name="acquisition_method" options={METHODS.map((m) => ({ value: m, label: m }))} placeholder="—" />
        </Field>
        <Field label="Basis">
          <input name="basis" type="number" step="any" />
        </Field>
        <Field label="Current value">
          <input name="current_value" type="number" step="any" defaultValue={0} />
        </Field>
        <Field label="Debt balance">
          <input name="debt_balance" type="number" step="any" defaultValue={0} />
        </Field>
        <Field label="Income class">
          <Select name="income_class" options={INCOME_OPTIONS} placeholder="—" />
        </Field>
        <Field label="Notes" className="sm:col-span-2 xl:col-span-4">
          <input name="notes" />
        </Field>
      </FormGrid>
      <Button type="submit">Add asset</Button>
    </form>
  );
}
