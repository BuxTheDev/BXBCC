"use client";
import { useTransition } from "react";
import { setUnitStatus } from "@/lib/actions";
import type { Unit } from "@/lib/types";

const STATUSES: Unit["status"][] = ["occupied", "vacant", "turning", "in_acquisition", "offline"];

export default function UnitStatusSelect({ id, status }: { id: string; status: Unit["status"] }) {
  const [pending, start] = useTransition();
  return (
    <select value={status} disabled={pending} onChange={e => start(() => setUnitStatus(id, e.target.value))} style={{ padding: "3px 6px", fontSize: 12, width: "auto" }} aria-label="Unit status">
      {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
    </select>
  );
}
