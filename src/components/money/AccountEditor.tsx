"use client";
import { useState } from "react";
import { upsertAccount } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, Select, FormGrid, entityOptions } from "@/components/money/fields";
import type { Account, Entity } from "@/lib/types";

const KINDS = ["checking", "savings", "brokerage", "cash", "credit", "loan", "mortgage", "other"];

/** Pick an existing account to edit, or leave the picker empty to add a new one. */
export default function AccountEditor({ accounts, entities }: { accounts: Account[]; entities: Entity[] }) {
  const [id, setId] = useState("");
  const editing = accounts.find((a) => a.id === id);

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Field label="Editing">
          <select value={id} onChange={(e) => setId(e.target.value)}>
            <option value="">New account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <form key={id || "new"} action={upsertAccount} className="space-y-4">
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <FormGrid>
          <Field label="Name" className="sm:col-span-2">
            <input name="name" required defaultValue={editing?.name ?? ""} placeholder="Operating checking" />
          </Field>
          <Field label="Kind">
            <select name="kind" defaultValue={editing?.kind ?? "checking"}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Entity">
            <Select name="entity_id" options={entityOptions(entities)} value={editing?.entity_id} placeholder="Unassigned" />
          </Field>
          <Field label="Institution">
            <input name="institution" defaultValue={editing?.institution ?? ""} />
          </Field>
          <Field label="Last 4">
            <input name="last4" defaultValue={editing?.last4 ?? ""} maxLength={4} />
          </Field>
          <Field label="Balance">
            <input name="balance" type="number" step="any" defaultValue={editing?.balance ?? 0} />
          </Field>
          <Field label="Floor alert">
            <input name="floor_alert" type="number" step="any" defaultValue={editing?.floor_alert ?? ""} />
          </Field>
        </FormGrid>
        <p className="text-[12px] text-muted">Credit, loan and mortgage accounts are treated as liabilities.</p>
        <Button type="submit">{editing ? "Save account" : "Add account"}</Button>
      </form>
    </div>
  );
}
