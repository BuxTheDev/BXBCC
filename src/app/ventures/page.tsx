import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getAllVentureData, getFronts, getEntities, getGoals } from "@/lib/data";
import { usd, usdCompact } from "@/lib/format";
import { Card, Grid, PageHeader, SectionLabel } from "@/components/ui";
import FrontsTable from "@/components/crm/FrontsTable";
import type { Front } from "@/lib/types";

const STATUS_ORDER: Record<Front["status"], number> = { active: 0, parked: 1, done: 2 };

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className="tabular mt-1 text-[17px] font-semibold leading-none tracking-[-0.01em]">{value}</div>
    </div>
  );
}

export default async function VenturesPage() {
  const [ventures, fronts, entities, goals] = await Promise.all([
    getAllVentureData(), getFronts(), getEntities(), getGoals(),
  ]);

  const ranked = [...fronts].sort(
    (a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || (a.rank - b.rank) || a.name.localeCompare(b.name),
  );

  return (
    <>
      <PageHeader title="Ventures" sub="What I'm working on, and where" />

      <Grid cols={2}>
        {ventures.map((d) => {
          const v = d.venture;
          const openDeals = d.deals.filter((x) => x.status === "open").length;
          return (
            <Link
              key={v.slug}
              href={`/ventures/${v.slug}`}
              className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div style={{ height: 3, background: v.accent }} />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{v.name}</h2>
                    <p className="mt-1 max-w-sm text-[13px] text-muted">{v.blurb}</p>
                  </div>
                  <span
                    className="mt-1 shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                    style={{ background: `color-mix(in srgb, ${v.accent} 16%, transparent)`, color: v.accent }}
                  >
                    {v.incomeClass}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[12px] text-fg-dim">
                  <MapPin size={13} className="text-muted" />
                  {v.place}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-border-soft bg-surface-2/50 p-3.5">
                  <MiniStat label="Open pipeline" value={usdCompact(d.openValue)} />
                  <MiniStat label="Deals open" value={String(openDeals)} />
                  <MiniStat label="Units" value={d.totalUnits ? `${d.occupied} of ${d.totalUnits}` : "—"} />
                </div>

                <div className="mt-5 flex-1">
                  <SectionLabel>Fronts</SectionLabel>
                  {d.fronts.length ? (
                    <ul className="space-y-2">
                      {d.fronts.map((f) => (
                        <li key={f.id} className="flex items-start gap-2.5 text-[13px]">
                          <i className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: v.accent }} />
                          <span className="min-w-0">
                            <span className="font-medium text-fg-dim">{f.name}</span>
                            {f.next_action && <span className="text-muted"> — {f.next_action}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-muted">No fronts mapped yet.</p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border-soft pt-3.5 text-[13px]">
                  <span className="tabular text-muted">T12 {usd(d.incomeT12)}</span>
                  <span className="flex items-center gap-1.5 font-medium text-accent">
                    Open <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </Grid>

      <div className="mt-4">
        <Card title="Ranked fronts" sub="Every front, active first — edit inline or add a new one">
          <FrontsTable
            fronts={ranked}
            entities={entities.map((e) => ({ id: e.id, name: e.name }))}
            goals={goals.map((g) => ({ id: g.id, name: g.name }))}
          />
        </Card>
      </div>
    </>
  );
}
