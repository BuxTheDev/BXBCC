import { upsertFront } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select, INCOME_OPTIONS } from "@/components/life/helpers";
import type { Front, Entity, Goal } from "@/lib/types";

export function FrontForm({ front, entities, goals }: { front?: Front; entities: Entity[]; goals: Goal[] }) {
  return (
    <form action={upsertFront} className="grid gap-3 rounded-lg border border-border bg-surface-2/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
      {front && <input type="hidden" name="id" value={front.id} />}
      <Field label="Name" className="lg:col-span-2"><input name="name" required defaultValue={front?.name ?? ""} /></Field>
      <Field label="Rank"><input name="rank" type="number" defaultValue={front?.rank ?? 100} /></Field>
      <Field label="Status">
        <select name="status" defaultValue={front?.status ?? "active"}>
          <option value="active">active</option><option value="parked">parked</option><option value="done">done</option>
        </select>
      </Field>
      <Field label="Current state" className="sm:col-span-2"><input name="current_state" defaultValue={front?.current_state ?? ""} /></Field>
      <Field label="Next action" className="sm:col-span-2"><input name="next_action" defaultValue={front?.next_action ?? ""} /></Field>
      <Field label="Why" className="sm:col-span-2 lg:col-span-4"><input name="why" defaultValue={front?.why ?? ""} /></Field>
      <Field label="Income class"><Select name="income_class" options={INCOME_OPTIONS} value={front?.income_class} /></Field>
      <Field label="Entity"><Select name="entity_id" options={entities.map(e => ({ value: e.id, label: e.name }))} value={front?.entity_id} /></Field>
      <Field label="Goal"><Select name="goal_id" options={goals.map(g => ({ value: g.id, label: g.name }))} value={front?.goal_id} /></Field>
      <Field label="Place"><input name="place" defaultValue={front?.place ?? ""} /></Field>
      <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">{front ? "Save front" : "Add front"}</Button></div>
    </form>
  );
}
