"use client";
import { useState, type ReactNode } from "react";
import { Badge, Button } from "@/components/ui";
import { ClassBadge } from "@/components/life/helpers";
import type { Front } from "@/lib/types";

/** Client list: rows plus one open editor at a time. Editors are server-rendered and passed in by id. */
export function FrontsList({ fronts, editors, entityNames, goalNames }: { fronts: Front[]; editors: Record<string, ReactNode>; entityNames: Record<string, string>; goalNames: Record<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs uppercase tracking-wide text-muted">
          {["#", "Front", "Status", "Class", "Current state", "Next action", "Entity", "Goal", "Place", ""].map(h => <th key={h} className="pb-2 pr-3 font-medium">{h}</th>)}
        </tr></thead>
        <tbody>
          {fronts.map(f => (
            <FragmentRow key={f.id} f={f} open={openId === f.id} toggle={() => setOpenId(openId === f.id ? null : f.id)} editor={editors[f.id]} entityNames={entityNames} goalNames={goalNames} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRow({ f, open, toggle, editor, entityNames, goalNames }: { f: Front; open: boolean; toggle: () => void; editor: ReactNode; entityNames: Record<string, string>; goalNames: Record<string, string> }) {
  const tone = f.status === "active" ? "ok" : f.status === "parked" ? "muted" : "accent";
  return (
    <>
      <tr className="[&_td]:border-t [&_td]:border-border [&_td]:py-2 [&_td]:pr-3 [&_td]:align-top">
        <td className="tabular-nums text-muted">{f.rank}</td>
        <td className="font-medium">{f.name}{f.why && <div className="text-xs font-normal text-muted">{f.why}</div>}</td>
        <td><Badge tone={tone}>{f.status}</Badge></td>
        <td><ClassBadge c={f.income_class} /></td>
        <td className="max-w-56 text-xs text-muted">{f.current_state ?? "—"}</td>
        <td className="max-w-56 text-xs">{f.next_action ?? "—"}</td>
        <td className="text-xs">{f.entity_id ? entityNames[f.entity_id] ?? "—" : "—"}</td>
        <td className="text-xs">{f.goal_id ? goalNames[f.goal_id] ?? "—" : "—"}</td>
        <td className="text-xs text-muted">{f.place ?? "—"}</td>
        <td className="text-right"><Button type="button" variant="ghost" className="text-xs" onClick={toggle}>{open ? "Close" : "Edit"}</Button></td>
      </tr>
      {open && <tr><td colSpan={10} className="border-t border-border pb-3">{editor}</td></tr>}
    </>
  );
}
