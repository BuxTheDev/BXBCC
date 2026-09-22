import { addActivity } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field } from "./helpers";

export default function AddActivityForm({ recordType, recordId, contactId }: { recordType: "deal" | "contact"; recordId: string; contactId?: string | null }) {
  return (
    <form action={addActivity} className="space-y-2">
      <input type="hidden" name="record_type" value={recordType} />
      <input type="hidden" name="record_id" value={recordId} />
      {contactId && <input type="hidden" name="contact_id" value={contactId} />}
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <Field label="Kind">
          <select name="kind" defaultValue="note">
            {["note", "call", "sms", "email", "meeting"].map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Body"><textarea name="body" rows={2} required /></Field>
      </div>
      <div className="flex justify-end"><Button type="submit">Log activity</Button></div>
    </form>
  );
}
