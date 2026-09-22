"use client";
import { useState } from "react";
import { upsertEntity } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select, FormGrid } from "@/components/money/fields";
import type { Entity } from "@/lib/types";

const KINDS: Entity["kind"][] = ["holdco", "propco", "opco", "nonprofit", "personal", "other"];

/** Pick an existing entity to edit, or leave the picker empty to add a new one. */
export default function EntityEditor({ entities }: { entities: Entity[] }) {
  const [id, setId] = useState("");
  const editing = entities.find((e) => e.id === id);
  const parents = entities.filter((e) => e.id !== id).map((e) => ({ value: e.id, label: e.name }));

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Field label="Editing">
          <select value={id} onChange={(e) => setId(e.target.value)}>
            <option value="">New entity</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <form key={id || "new"} action={upsertEntity} className="space-y-4">
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <FormGrid>
          <Field label="Name" className="sm:col-span-2">
            <input name="name" required defaultValue={editing?.name ?? ""} placeholder="Wyoming Holdco" />
          </Field>
          <Field label="Kind">
            <select name="kind" defaultValue={editing?.kind ?? "opco"}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Parent">
            <Select name="parent_id" options={parents} value={editing?.parent_id} placeholder="Top level" />
          </Field>
          <Field label="Jurisdiction">
            <input name="jurisdiction" defaultValue={editing?.jurisdiction ?? ""} placeholder="AZ" />
          </Field>
          <Field label="EIN">
            <input name="ein" defaultValue={editing?.ein ?? ""} />
          </Field>
          <Field label="Ownership %">
            <input name="ownership_pct" type="number" step="any" defaultValue={editing?.ownership_pct ?? 100} />
          </Field>
          <Field label="Formed on">
            <input name="formed_on" type="date" defaultValue={editing?.formed_on ?? ""} />
          </Field>
          <Field label="Registered agent" className="sm:col-span-2">
            <input name="registered_agent" defaultValue={editing?.registered_agent ?? ""} />
          </Field>
          <Field label="Annual filing due">
            <input name="annual_filing_due" type="date" defaultValue={editing?.annual_filing_due ?? ""} />
          </Field>
          <Field label="Notes" className="sm:col-span-2 xl:col-span-4">
            <input name="notes" defaultValue={editing?.notes ?? ""} />
          </Field>
        </FormGrid>
        <Button type="submit">{editing ? "Save entity" : "Add entity"}</Button>
      </form>
    </div>
  );
}
