import { Badge, Empty } from "@/components/ui";
import { cn, daysBetween } from "@/lib/format";
import type { Entity } from "@/lib/types";

const KIND_TONE: Record<Entity["kind"], "accent" | "ok" | "warn" | "muted" | "outline"> = {
  holdco: "accent",
  propco: "ok",
  opco: "outline",
  nonprofit: "warn",
  personal: "muted",
  other: "muted",
};

type EntityNode = Entity & { kids: EntityNode[] };

function build(rows: Entity[], parent: string | null): EntityNode[] {
  return rows.filter((e) => e.parent_id === parent).map((e) => ({ ...e, kids: build(rows, e.id) }));
}

function Node({ entity }: { entity: EntityNode }) {
  const dueIn = entity.annual_filing_due ? -daysBetween(entity.annual_filing_due) : null;
  const filingSoon = dueIn != null && dueIn <= 30;

  return (
    <li>
      <div className="rounded-xl border border-border bg-surface-2/40 px-4 py-3 card-hover">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{entity.name}</span>
          <Badge tone={KIND_TONE[entity.kind]}>{entity.kind}</Badge>
          {entity.jurisdiction && <Badge tone="muted">{entity.jurisdiction}</Badge>}
          <span className="tabular text-[12px] text-fg-dim">{Number(entity.ownership_pct ?? 0)}% owned</span>
          {entity.annual_filing_due && (
            <Badge tone={filingSoon ? "warn" : "outline"}>
              Filing {entity.annual_filing_due}
              {filingSoon && dueIn != null && ` · ${dueIn < 0 ? "overdue" : `${dueIn}d`}`}
            </Badge>
          )}
        </div>
        {entity.notes && <p className="mt-1 text-[13px] text-muted">{entity.notes}</p>}
      </div>
      {entity.kids.length > 0 && <Branch nodes={entity.kids} depth={1} />}
    </li>
  );
}

function Branch({ nodes, depth }: { nodes: EntityNode[]; depth: number }) {
  return (
    <ul className={cn("space-y-2.5", depth > 0 && "ml-4 mt-2.5 border-l border-border pl-4")}>
      {nodes.map((n) => (
        <Node key={n.id} entity={n} />
      ))}
    </ul>
  );
}

/** Ownership tree built from entities.parent_id. */
export default function EntityTree({ entities }: { entities: Entity[] }) {
  if (entities.length === 0) return <Empty>No entities yet.</Empty>;
  const ids = new Set(entities.map((e) => e.id));
  const rooted = entities.map((e) => (e.parent_id && ids.has(e.parent_id) ? e : { ...e, parent_id: null }));
  return <Branch nodes={build(rooted, null)} depth={0} />;
}
