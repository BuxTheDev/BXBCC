import { upsertGoal } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select } from "@/components/life/helpers";
import type { Goal } from "@/lib/types";

export function GoalForm({ goal, goals }: { goal?: Goal; goals: Goal[] }) {
  const parents = goals.filter(g => g.id !== goal?.id).map(g => ({ value: g.id, label: g.name }));
  return (
    <form action={upsertGoal} className="grid gap-3 rounded-lg border border-border bg-surface-2/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
      {goal && <input type="hidden" name="id" value={goal.id} />}
      <Field label="Name" className="sm:col-span-2"><input name="name" required defaultValue={goal?.name ?? ""} /></Field>
      <Field label="Parent goal"><Select name="parent_id" options={parents} value={goal?.parent_id} placeholder="Top level" /></Field>
      <Field label="Status">
        <select name="status" defaultValue={goal?.status ?? "active"}>
          {["active", "achieved", "paused", "dropped"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Metric key"><input name="metric" defaultValue={goal?.metric ?? ""} placeholder="net_worth" /></Field>
      <Field label="Target"><input name="target_value" type="number" step="any" defaultValue={goal?.target_value ?? ""} /></Field>
      <Field label="Current"><input name="current_value" type="number" step="any" defaultValue={goal?.current_value ?? 0} /></Field>
      <Field label="Unit"><input name="unit" defaultValue={goal?.unit ?? ""} placeholder="USD" /></Field>
      <Field label="Horizon"><input name="horizon" defaultValue={goal?.horizon ?? ""} placeholder="2030" /></Field>
      <Field label="Sort"><input name="sort" type="number" defaultValue={goal?.sort ?? 0} /></Field>
      <Field label="Why" className="sm:col-span-2"><input name="why" defaultValue={goal?.why ?? ""} /></Field>
      <div className="sm:col-span-2 lg:col-span-4"><Button type="submit">{goal ? "Save goal" : "Add goal"}</Button></div>
    </form>
  );
}
