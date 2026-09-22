import { upsertEntity } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select } from "@/components/life/helpers";
import type { Entity } from "@/lib/types";

const KINDS = ["holdco", "propco", "opco", "nonprofit", "personal", "other"];

export function EntityForm({ entity, entities }: { entity?: Entity; entities: Entity[] }) {
  const parents = entities.filter(e => e.id !== entity?.id).map(e => ({ value: e.id, label: e.name }));
  return (
    <form action={upsertEntity} className="grid gap-3 rounded-lg border border-border bg-surface-2/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
      {entity && <input type="hidden" name="id" value={entity.id} />}
      <Field label="Name" className="sm:col-span-2"><input name="name" required defaultValue={entity?.name ?? ""} /></Field>
      <Field label="Kind"><select name="kind" defaultValue={entity?.kind ?? "opco"}>{KINDS.map(k => <option key={k} value={k}>{k}</option>)}</select></Field>
      <Field label="Parent"><Select name="parent_id" options={parents} value={entity?.parent_id} placeholder="Top level" /></Field>
      <Field label="Jurisdiction"><input name="jurisdiction" defaultValue={entity?.jurisdiction ?? ""} placeholder="AZ" /></Field>
      <Field label="EIN"><input name="ein" defaultValue={entity?.ein ?? ""} /></Field>
      <Field label="Formed on"><input name="formed_on" type="date" defaultValue={entity?.formed_on ?? ""} /></Field>
      <Field label="Ownership %"><input name="ownership_pct" type="number" step="any" defaultValue={entity?.ownership_pct ?? 100} /></Field>
      <Field label="Registered agent" className="sm:col-span-2"><input name="registered_agent" defaultValue={entity?.registered_agent ?? ""} /></Field>
      <Field label="Annual filing due"><input name="annual_filing_due" type="date" defaultValue={entity?.annual_filing_due ?? ""} /></Field>
      <Field label="Notes" className="sm:col-span-2 lg:col-span-4"><input name="notes" defaultValue={entity?.notes ?? ""} /></Field>
      <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">{entity ? "Save entity" : "Add entity"}</Button></div>
    </form>
  );
}
