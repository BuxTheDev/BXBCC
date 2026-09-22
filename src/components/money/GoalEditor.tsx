"use client";
import { useState } from "react";
import { upsertGoal } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select, FormGrid } from "@/components/money/fields";
import type { Goal } from "@/lib/types";

const STATUSES: Goal["status"][] = ["active", "achieved", "paused", "dropped"];

/** Pick an existing goal to edit, or leave the picker empty to add a new one. */
export default function GoalEditor({ goals }: { goals: Goal[] }) {
  const [id, setId] = useState("");
  const editing = goals.find((g) => g.id === id);
  const parents = goals.filter((g) => g.id !== id).map((g) => ({ value: g.id, label: g.name }));

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Field label="Editing">
          <select value={id} onChange={(e) => setId(e.target.value)}>
            <option value="">New goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <form key={id || "new"} action={upsertGoal} className="space-y-4">
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <FormGrid>
          <Field label="Name" className="sm:col-span-2">
            <input name="name" required defaultValue={editing?.name ?? ""} placeholder="$30M net worth by 30" />
          </Field>
          <Field label="Parent goal">
            <Select name="parent_id" options={parents} value={editing?.parent_id} placeholder="Top level" />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={editing?.status ?? "active"}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Metric">
            <input name="metric" defaultValue={editing?.metric ?? ""} placeholder="net_worth" />
          </Field>
          <Field label="Target">
            <input name="target_value" type="number" step="any" defaultValue={editing?.target_value ?? ""} />
          </Field>
          <Field label="Current">
            <input name="current_value" type="number" step="any" defaultValue={editing?.current_value ?? 0} />
          </Field>
          <Field label="Unit">
            <input name="unit" defaultValue={editing?.unit ?? ""} placeholder="USD" />
          </Field>
          <Field label="Horizon">
            <input name="horizon" defaultValue={editing?.horizon ?? ""} placeholder="by 30" />
          </Field>
          <Field label="Sort">
            <input name="sort" type="number" defaultValue={editing?.sort ?? 0} />
          </Field>
          <Field label="Why" className="sm:col-span-2 xl:col-span-4">
            <input name="why" defaultValue={editing?.why ?? ""} />
          </Field>
        </FormGrid>
        <p className="text-[12px] text-muted">A goal whose metric is net_worth tracks the live number instead of the stored one.</p>
        <Button type="submit">{editing ? "Save goal" : "Add goal"}</Button>
      </form>
    </div>
  );
}
