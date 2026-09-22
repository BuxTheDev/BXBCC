"use client";
import { useTransition } from "react";
import { moveDeal } from "@/lib/actions";
import type { PipelineStage } from "@/lib/types";

export default function StageSelect({ dealId, stageId, stages }: { dealId: string; stageId: string | null; stages: PipelineStage[] }) {
  const [pending, start] = useTransition();
  return (
    <select
      value={stageId ?? ""}
      disabled={pending}
      onChange={(e) => start(() => moveDeal(dealId, e.target.value))}
      className="tabular"
      style={{ padding: "4px 7px", fontSize: 11.5 }}
      aria-label="Move to stage"
    >
      {stages.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}
