import { createTask } from "@/lib/actions";
import { Button } from "@/components/ui";
import type { Front } from "@/lib/types";
import { Field } from "./helpers";

export default function AddTaskForm({ fronts, recordType, recordId, compact }: { fronts: Front[]; recordType?: string; recordId?: string; compact?: boolean }) {
  return (
    <form action={createTask} className="space-y-2">
      {recordType && <input type="hidden" name="record_type" value={recordType} />}
      {recordId && <input type="hidden" name="record_id" value={recordId} />}
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-2 md:grid-cols-4"}>
        <Field label="Title" className="col-span-2"><input name="title" required /></Field>
        <Field label="Priority">
          <select name="priority" defaultValue="normal">{["low", "normal", "high", "urgent"].map(p => <option key={p} value={p}>{p}</option>)}</select>
        </Field>
        <Field label="Due"><input type="date" name="due_on" /></Field>
        <Field label="Front" className="col-span-2">
          <select name="front_id" defaultValue=""><option value="">—</option>{fronts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
        </Field>
        <Field label="Notes" className="col-span-2"><input name="notes" /></Field>
      </div>
      <div className="flex justify-end"><Button type="submit">Add task</Button></div>
    </form>
  );
}
