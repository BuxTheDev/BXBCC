import { Card, PageHeader, Empty } from "@/components/ui";
import { FrontForm } from "@/components/life/FrontForm";
import { FrontsList } from "@/components/life/FrontsList";
import { getFronts, getEntities, getGoals } from "@/lib/data";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function FrontsPage() {
  const [fronts, entities, goals] = await Promise.all([getFronts(), getEntities(), getGoals()]);
  const order = { active: 0, parked: 1, done: 2 };
  const sorted = [...fronts].sort((a, b) => order[a.status] - order[b.status] || a.rank - b.rank);
  const editors: Record<string, ReactNode> = {};
  for (const f of sorted) editors[f.id] = <FrontForm front={f} entities={entities} goals={goals} />;
  const entityNames = Object.fromEntries(entities.map(e => [e.id, e.name]));
  const goalNames = Object.fromEntries(goals.map(g => [g.id, g.name]));
  const active = fronts.filter(f => f.status === "active").length;

  return (
    <div className="space-y-5">
      <PageHeader title="Fronts" sub={`${active} active, ${fronts.length - active} parked or done. Ranked by priority; each front carries a current state and a next action.`} />
      <Card title="All fronts">
        {sorted.length === 0 ? <Empty>No fronts yet</Empty> : <FrontsList fronts={sorted} editors={editors} entityNames={entityNames} goalNames={goalNames} />}
      </Card>
      <Card title="Add front">
        <FrontForm entities={entities} goals={goals} />
      </Card>
    </div>
  );
}
