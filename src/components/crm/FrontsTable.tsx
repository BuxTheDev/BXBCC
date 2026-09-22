"use client";
import { Fragment, useState } from "react";
import { upsertFront } from "@/lib/actions";
import type { Front, IncomeClass } from "@/lib/types";
import { Badge, Button, ClassBadge, Table } from "@/components/ui";
import { VentureChip } from "./VentureChip";
import { Field } from "./helpers";

type Opt = { id: string; name: string };

const STATUS_TONE: Record<Front["status"], "ok" | "warn" | "muted"> = { active: "ok", parked: "warn", done: "muted" };
const CLASSES: IncomeClass[] = ["SI", "LI", "BOI", "ABI", "KBI"];

function FrontFields({ front, entities, goals }: { front?: Front; entities: Opt[]; goals: Opt[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {front && <input type="hidden" name="id" value={front.id} />}
      <Field label="Name" className="md:col-span-2"><input name="name" defaultValue={front?.name ?? ""} required /></Field>
      <Field label="Rank"><input name="rank" type="number" defaultValue={front?.rank ?? 100} /></Field>
      <Field label="Status">
        <select name="status" defaultValue={front?.status ?? "active"}>
          {["active", "parked", "done"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Current state" className="md:col-span-2"><input name="current_state" defaultValue={front?.current_state ?? ""} /></Field>
      <Field label="Next action" className="md:col-span-2"><input name="next_action" defaultValue={front?.next_action ?? ""} /></Field>
      <Field label="Why" className="md:col-span-2"><input name="why" defaultValue={front?.why ?? ""} /></Field>
      <Field label="Income class">
        <select name="income_class" defaultValue={front?.income_class ?? ""}>
          <option value="">—</option>
          {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Place"><input name="place" defaultValue={front?.place ?? ""} /></Field>
      <Field label="Entity" className="md:col-span-2">
        <select name="entity_id" defaultValue={front?.entity_id ?? ""}>
          <option value="">—</option>
          {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </Field>
      <Field label="Goal" className="md:col-span-2">
        <select name="goal_id" defaultValue={front?.goal_id ?? ""}>
          <option value="">—</option>
          {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </Field>
    </div>
  );
}

export default function FrontsTable({ fronts, entities, goals }: { fronts: Front[]; entities: Opt[]; goals: Opt[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <Table head={["Rank", "Front", "Venture", "Current state", "Next action", "Class", "Place", "Status", ""]}>
        {fronts.map((f) => {
          const open = openId === f.id;
          return (
            <Fragment key={f.id}>
              <tr className={f.status !== "active" ? "text-muted" : undefined}>
                <td className="tabular w-10 text-muted">{f.rank}</td>
                <td className="font-medium text-fg">{f.name}</td>
                <td><VentureChip frontName={f.name} /></td>
                <td className="max-w-[240px] text-fg-dim">{f.current_state ?? "—"}</td>
                <td className="max-w-[240px] text-fg-dim">{f.next_action ?? "—"}</td>
                <td><ClassBadge c={f.income_class} /></td>
                <td className="whitespace-nowrap text-muted">{f.place ?? "—"}</td>
                <td><Badge tone={STATUS_TONE[f.status]}>{f.status}</Badge></td>
                <td className="text-right">
                  <Button size="sm" variant="ghost" type="button" onClick={() => setOpenId(open ? null : f.id)}>
                    {open ? "Close" : "Edit"}
                  </Button>
                </td>
              </tr>
              {open && (
                <tr>
                  <td colSpan={9}>
                    <form action={upsertFront} className="rounded-xl border border-border bg-surface-2/50 p-4">
                      <FrontFields front={f} entities={entities} goals={goals} />
                      <div className="mt-3 flex justify-end gap-2">
                        <Button size="sm" variant="ghost" type="button" onClick={() => setOpenId(null)}>Cancel</Button>
                        <Button size="sm" type="submit">Save front</Button>
                      </div>
                    </form>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </Table>

      <div className="mt-4 border-t border-border-soft pt-4">
        {adding ? (
          <form action={upsertFront} className="rounded-xl border border-border bg-surface-2/50 p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">New front</div>
            <FrontFields entities={entities} goals={goals} />
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="ghost" type="button" onClick={() => setAdding(false)}>Cancel</Button>
              <Button size="sm" type="submit">Add front</Button>
            </div>
          </form>
        ) : (
          <Button size="sm" variant="subtle" type="button" onClick={() => setAdding(true)}>Add front</Button>
        )}
      </div>
    </div>
  );
}
