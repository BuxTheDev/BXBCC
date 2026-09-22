import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Wallet, Scale, Home, TrendingUp } from "lucide-react";
import { getVentureData, getContacts } from "@/lib/data";
import { getVenture } from "@/lib/ventures";
import { createDeal } from "@/lib/actions";
import { usd, dateShort, daysBetween, relTime } from "@/lib/format";
import {
  Avatar, Badge, Button, Card, ClassBadge, Empty, Grid, HeroBand, HeroStat, Row, SectionLabel,
} from "@/components/ui";
import { Field, UnitBadge, ActivityBadge, PriorityBadge } from "@/components/crm/helpers";
import StageSelect from "@/components/crm/StageSelect";
import UnitStatusSelect from "@/components/crm/UnitStatusSelect";
import { TaskCheck } from "@/components/app/TaskCheck";

export default async function VenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVenture(slug);
  if (!v) notFound();

  const [d, allContacts] = await Promise.all([getVentureData(v), getContacts()]);
  const contactName = (id: string | null | undefined) =>
    allContacts.find((c) => c.id === id)?.full_name ?? null;
  const dealTitle = (id: string) => d.deals.find((x) => x.id === id)?.title ?? "Deal";

  const openTasks = d.tasks.filter((t) => t.status === "todo" || t.status === "doing");
  const acts = [...d.activities].sort((a, b) => +new Date(b.occurred_at) - +new Date(a.occurred_at)).slice(0, 12);
  const firstPipeline = d.pipelines[0];
  const firstStages = firstPipeline ? d.stages.filter((s) => s.pipeline_id === firstPipeline.id) : [];

  return (
    <>
      <HeroBand
        title={v.name}
        sub={v.blurb}
        action={
          <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white/85">
            <MapPin size={13} /> {v.place}
          </span>
        }
      >
        <HeroStat label="Open pipeline" value={usd(d.openValue)} icon={<Wallet size={14} />} />
        <HeroStat label="Weighted" value={usd(d.weightedValue)} icon={<Scale size={14} />} />
        <HeroStat label="Units" value={`${d.occupied} of ${d.totalUnits}`} icon={<Home size={14} />} />
        <HeroStat label="T12 income" value={usd(d.incomeT12)} icon={<TrendingUp size={14} />} />
      </HeroBand>

      <Card className="mb-4" pad={false}>
        <div className="flex flex-wrap items-start gap-4 p-5">
          <i className="mt-1 h-10 w-[3px] shrink-0 rounded-full" style={{ background: v.accent }} />
          <div className="min-w-0 flex-1">
            <SectionLabel>Why this is on the list</SectionLabel>
            <p className="max-w-3xl text-[14px] leading-relaxed text-fg-dim">{v.why}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ClassBadge c={v.incomeClass} />
            {d.fronts[0]?.income_class && d.fronts[0].income_class !== v.incomeClass && (
              <ClassBadge c={d.fronts[0].income_class} />
            )}
          </div>
        </div>
      </Card>

      <Card title="Pipeline" sub={`${d.deals.filter((x) => x.status === "open").length} open deals across ${d.pipelines.length} pipeline${d.pipelines.length === 1 ? "" : "s"}`} className="mb-4">
        {d.pipelines.length ? (
          <div className="space-y-7">
            {d.pipelines.map((p) => {
              const stages = d.stages.filter((s) => s.pipeline_id === p.id).sort((a, b) => a.sort - b.sort);
              return (
                <div key={p.id}>
                  <SectionLabel>{p.name}</SectionLabel>
                  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                    {stages.map((s) => {
                      const deals = d.deals.filter((x) => x.stage_id === s.id);
                      const value = deals.reduce((a, x) => a + Number(x.value), 0);
                      return (
                        <div key={s.id} className="w-[236px] shrink-0 rounded-xl border border-border-soft bg-surface-2/40 p-3">
                          <div className="mb-3 flex items-baseline justify-between gap-2">
                            <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{s.name}</span>
                            <span className="tabular shrink-0 text-[11px] text-muted">{deals.length}</span>
                          </div>
                          <div className="tabular mb-3 text-[13px] font-semibold">{usd(value)}</div>
                          <div className="space-y-2">
                            {deals.map((deal) => {
                              const idle = daysBetween(deal.last_activity_at);
                              return (
                                <div key={deal.id} className="card-hover rounded-lg border border-border bg-surface p-2.5">
                                  <Link href={`/deals/${deal.id}`} className="block text-[13px] font-medium leading-snug hover:text-accent">
                                    {deal.title}
                                  </Link>
                                  <div className="tabular mt-1.5 text-[13px] font-semibold">{usd(deal.value)}</div>
                                  {deal.primary_contact_id && (
                                    <div className="mt-1 truncate text-[11.5px] text-muted">{contactName(deal.primary_contact_id) ?? "—"}</div>
                                  )}
                                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <Badge tone={idle > 14 ? "warn" : "muted"}>{idle}d idle</Badge>
                                    {deal.source && <Badge tone="outline">{deal.source}</Badge>}
                                  </div>
                                  <div className="mt-2">
                                    <StageSelect dealId={deal.id} stageId={deal.stage_id} stages={stages} />
                                  </div>
                                </div>
                              );
                            })}
                            {deals.length === 0 && <p className="py-2 text-center text-[11.5px] text-muted">Empty</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty>No pipelines mapped to this venture yet.</Empty>
        )}
      </Card>

      <Grid cols={2} className="mb-4">
        <Card title="Units" sub={`${d.occupied} occupied of ${d.totalUnits}`}>
          {d.properties.length ? (
            <div className="space-y-5">
              {d.properties.map((p) => {
                const units = d.units.filter((u) => u.property_id === p.id);
                return (
                  <div key={p.id}>
                    <SectionLabel>{p.address1}{p.city ? ` · ${p.city}` : ""}</SectionLabel>
                    {units.length ? (
                      <div>
                        {units.map((u) => (
                          <Row key={u.id}>
                            <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{u.name}</span>
                            <UnitBadge s={u.status} />
                            <span className="tabular w-20 text-right text-[13px] text-fg-dim">{u.target_rate ? usd(u.target_rate) : "—"}</span>
                            <span className="tabular w-16 text-right text-[12px] text-muted">
                              {u.status === "vacant" && u.vacant_since ? `${daysBetween(u.vacant_since)}d vac` : "—"}
                            </span>
                            <UnitStatusSelect id={u.id} status={u.status} />
                          </Row>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-muted">No units on this property.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty>No properties mapped to this venture.</Empty>
          )}
        </Card>

        <Card title="People" sub={`${d.contacts.length} on this venture's deals`}>
          {d.contacts.length ? (
            <div>
              {d.contacts.map((c) => (
                <Row key={c.id}>
                  <Avatar name={c.full_name || "?"} />
                  <span className="min-w-0 flex-1">
                    <Link href={`/people/${c.id}`} className="block truncate text-[13.5px] font-medium hover:text-accent">
                      {c.full_name || "(unnamed)"}
                    </Link>
                    {c.email && <span className="block truncate text-[12px] text-muted">{c.email}</span>}
                  </span>
                  {c.role && <Badge tone="accent">{c.role}</Badge>}
                  <span className="tabular w-28 shrink-0 text-right text-[12.5px] text-muted">{c.phone ?? "—"}</span>
                </Row>
              ))}
            </div>
          ) : (
            <Empty>No contacts attached to this venture&rsquo;s deals.</Empty>
          )}
        </Card>
      </Grid>

      <Grid cols={2} className="mb-4">
        <Card title="Open tasks" sub={`${openTasks.length} open`}>
          {openTasks.length ? (
            <div>
              {openTasks.map((t) => (
                <Row key={t.id}>
                  <TaskCheck id={t.id} status={t.status} />
                  <span className="min-w-0 flex-1 truncate text-[13.5px]">{t.title}</span>
                  <PriorityBadge p={t.priority} />
                  <span className="tabular w-16 shrink-0 text-right text-[12.5px] text-muted">{dateShort(t.due_on)}</span>
                </Row>
              ))}
            </div>
          ) : (
            <Empty>Nothing open here.</Empty>
          )}
        </Card>

        <Card title="Recent activity">
          {acts.length ? (
            <div>
              {acts.map((a) => (
                <Row key={a.id} className="items-start">
                  <Avatar name={contactName(a.contact_id) ?? dealTitle(a.record_id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] leading-snug text-fg-dim">{a.body ?? "(no body)"}</span>
                    <span className="mt-1 flex items-center gap-2">
                      <ActivityBadge kind={a.kind} />
                      <Link href={`/deals/${a.record_id}`} className="truncate text-[12px] text-muted hover:text-accent">
                        {dealTitle(a.record_id)}
                      </Link>
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-[12px] text-muted">{relTime(a.occurred_at)}</span>
                </Row>
              ))}
            </div>
          ) : (
            <Empty>No activity logged on this venture&rsquo;s deals.</Empty>
          )}
        </Card>
      </Grid>

      <Card title="New deal" sub={firstPipeline ? `Goes into ${firstPipeline.name}` : undefined}>
        {firstPipeline ? (
          <form action={createDeal} className="space-y-3">
            <input type="hidden" name="pipeline_id" value={firstPipeline.id} />
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="Title" className="md:col-span-2"><input name="title" required /></Field>
              <Field label="Stage">
                <select name="stage_id" defaultValue={firstStages[0]?.id ?? ""}>
                  {firstStages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Value"><input name="value" type="number" step="1" defaultValue={0} /></Field>
              <Field label="Primary contact" className="md:col-span-2">
                <select name="primary_contact_id" defaultValue="">
                  <option value="">—</option>
                  {allContacts.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.email || c.id}</option>)}
                </select>
              </Field>
              <Field label="Entity" className="md:col-span-2">
                <select name="entity_id" defaultValue={d.entities[0]?.id ?? ""}>
                  <option value="">—</option>
                  {d.entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </Field>
              <Field label="Expected close"><input type="date" name="expected_close" /></Field>
              <Field label="Source"><input name="source" placeholder="salvo, referral…" /></Field>
              <Field label="Front" className="md:col-span-2">
                <select name="front_id" defaultValue={d.fronts[0]?.id ?? ""}>
                  <option value="">—</option>
                  {d.fronts.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex justify-end"><Button type="submit">Create deal</Button></div>
          </form>
        ) : (
          <Empty>Add a pipeline for this venture before creating deals.</Empty>
        )}
      </Card>
    </>
  );
}
