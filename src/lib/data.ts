// Data access. Every reader works in demo mode (no env) and Supabase mode.
// Writers are in ./actions.ts (server actions).
import "server-only";
import { serverClient, isDemo } from "./supabase";
import { demo } from "./demo";
import type * as T from "./types";

async function table<R>(name: string, demoRows: R[], order?: { col: string; asc?: boolean }): Promise<R[]> {
  const sb = serverClient();
  if (!sb) return demoRows;
  let q = sb.from(name).select("*");
  if (order) q = q.order(order.col, { ascending: order.asc ?? true });
  const { data, error } = await q;
  if (error) throw new Error(`${name}: ${error.message}`);
  return data as R[];
}

export const getRoles = () => table<T.Role>("roles", demo.roles, { col: "sort" });
export const getFronts = () => table<T.Front>("fronts", demo.fronts, { col: "rank" });
export const getEntities = () => table<T.Entity>("entities", demo.entities, { col: "name" });
export const getAccounts = () => table<T.Account>("accounts", demo.accounts, { col: "name" });
export const getProperties = () => table<T.Property>("properties", demo.properties, { col: "address1" });
export const getAssets = () => table<T.Asset>("assets", demo.assets, { col: "name" });
export const getUnits = () => table<T.Unit>("units", demo.units, { col: "name" });
export const getGoals = () => table<T.Goal>("goals", demo.goals, { col: "sort" });
export const getOrganizations = () => table<T.Organization>("organizations", demo.organizations, { col: "name" });
export const getContacts = () => table<T.Contact>("contacts", demo.contacts, { col: "created_at", asc: false });
export const getPipelines = () => table<T.Pipeline>("pipelines", demo.pipelines, { col: "sort" });
export const getStages = () => table<T.PipelineStage>("pipeline_stages", demo.stages, { col: "sort" });
export const getDeals = () => table<T.Deal>("deals", demo.deals, { col: "updated_at", asc: false });
export const getTasks = () => table<T.Task>("tasks", demo.tasks, { col: "due_on" });
export const getActivities = () => table<T.Activity>("activities", demo.activities, { col: "occurred_at", asc: false });
export const getTransactions = () => table<T.Transaction>("transactions", demo.transactions, { col: "posted_on", asc: false });

export async function getNetWorth(): Promise<T.NetWorth> {
  const sb = serverClient();
  if (sb) {
    const { data, error } = await sb.from("v_net_worth").select("*").single();
    if (error) throw new Error(error.message);
    return data as T.NetWorth;
  }
  const [props, assets, accts] = [demo.properties, demo.assets, demo.accounts];
  const nw = props.reduce((s, p) => s + (p.current_value ?? 0) - (p.debt_balance ?? 0), 0)
    + assets.reduce((s, a) => s + a.current_value - a.debt_balance, 0)
    + accts.reduce((s, a) => s + (a.is_liability ? -a.balance : a.balance), 0);
  return {
    net_worth: nw,
    liquid_cash: accts.filter(a => ["checking", "savings"].includes(a.kind)).reduce((s, a) => s + a.balance, 0),
    total_debt: accts.filter(a => a.is_liability).reduce((s, a) => s + a.balance, 0) + props.reduce((s, p) => s + (p.debt_balance ?? 0), 0) + assets.reduce((s, a) => s + a.debt_balance, 0),
  };
}

export async function getIncomeByClassT12(): Promise<Record<T.IncomeClass, number>> {
  const tx = await getTransactions();
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 12);
  const out: Record<T.IncomeClass, number> = { SI: 0, LI: 0, BOI: 0, ABI: 0, KBI: 0 };
  for (const t of tx) if (t.amount > 0 && t.income_class && new Date(t.posted_on) >= cutoff) out[t.income_class] += Number(t.amount);
  return out;
}

/** Monthly income by class for the last 12 months, oldest first. */
export async function getIncomeSeries(): Promise<Array<{ month: string } & Record<T.IncomeClass, number>>> {
  const tx = await getTransactions();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(d.toISOString().slice(0, 7)); }
  const rows = months.map(m => ({ month: m, SI: 0, LI: 0, BOI: 0, ABI: 0, KBI: 0 }));
  for (const t of tx) {
    if (t.amount <= 0 || !t.income_class) continue;
    const r = rows.find(r => r.month === t.posted_on.slice(0, 7));
    if (r) r[t.income_class] += Number(t.amount);
  }
  return rows;
}

export async function getPortfolio(): Promise<T.Portfolio> {
  const units = await getUnits();
  const c = (s: T.Unit["status"]) => units.filter(u => u.status === s).length;
  return { occupied: c("occupied"), vacant: c("vacant"), turning: c("turning"), in_acquisition: c("in_acquisition"), total: units.length };
}

export async function getPipelineSummary(): Promise<T.PipelineSummaryRow[]> {
  const [pipes, stages, deals] = await Promise.all([getPipelines(), getStages(), getDeals()]);
  const rows: T.PipelineSummaryRow[] = [];
  for (const p of pipes) for (const s of stages.filter(s => s.pipeline_id === p.id)) {
    const ds = deals.filter(d => d.stage_id === s.id && d.status === "open");
    const value = ds.reduce((a, d) => a + Number(d.value), 0);
    rows.push({ slug: p.slug, pipeline: p.name, stage: s.name, sort: s.sort, deals: ds.length, value, weighted: value * Number(s.win_probability) });
  }
  return rows;
}

export interface Alert { level: "warn" | "info"; text: string; href?: string }
export async function getAlerts(): Promise<Alert[]> {
  const [units, deals, entities, accounts, tasks] = await Promise.all([getUnits(), getDeals(), getEntities(), getAccounts(), getTasks()]);
  const alerts: Alert[] = [];
  const today = Date.now();
  for (const u of units) if (u.status === "vacant" && u.vacant_since && (today - +new Date(u.vacant_since)) / 864e5 > 7)
    alerts.push({ level: "warn", text: `${u.name} vacant ${Math.floor((today - +new Date(u.vacant_since)) / 864e5)} days`, href: "/ventures" });
  for (const d of deals) if (d.status === "open" && (today - +new Date(d.last_activity_at)) / 864e5 > 14)
    alerts.push({ level: "warn", text: `No activity on “${d.title}” in 14+ days`, href: `/deals/${d.id}` });
  for (const e of entities) if (e.annual_filing_due && (+new Date(e.annual_filing_due) - today) / 864e5 < 30)
    alerts.push({ level: "info", text: `${e.name} filing due ${e.annual_filing_due}`, href: "/money?tab=entities" });
  for (const a of accounts) if (a.floor_alert != null && !a.is_liability && a.balance < a.floor_alert)
    alerts.push({ level: "warn", text: `${a.name} below floor ($${a.balance.toLocaleString()})`, href: "/money" });
  const overdue = tasks.filter(t => t.status !== "done" && t.status !== "cancelled" && t.due_on && +new Date(t.due_on) < today).length;
  if (overdue) alerts.push({ level: "warn", text: `${overdue} overdue task${overdue > 1 ? "s" : ""}`, href: "/tasks" });
  return alerts;
}

export { isDemo };

/* ---------------- venture-scoped reads ---------------- */
import { VENTURES, PERSONAL_FRONT_NAMES, type Venture } from "./ventures";

export interface VentureData {
  venture: Venture;
  fronts: T.Front[];
  entities: T.Entity[];
  properties: T.Property[];
  units: T.Unit[];
  pipelines: T.Pipeline[];
  stages: T.PipelineStage[];
  deals: T.Deal[];
  tasks: T.Task[];
  activities: T.Activity[];
  contacts: T.Contact[];
  /** trailing-12 income attributed to this venture's entities */
  incomeT12: number;
  openValue: number;
  weightedValue: number;
  occupied: number;
  totalUnits: number;
}

export async function getVentureData(v: Venture): Promise<VentureData> {
  const [fronts, entities, properties, units, pipelines, stages, deals, tasks, activities, contacts, tx] = await Promise.all([
    getFronts(), getEntities(), getProperties(), getUnits(), getPipelines(), getStages(), getDeals(), getTasks(), getActivities(), getContacts(), getTransactions(),
  ]);
  const ents = entities.filter(e => v.entityNames.includes(e.name));
  const entIds = new Set(ents.map(e => e.id));
  const props = properties.filter(p => p.use_tags?.some(t => v.useTags.includes(t)) || (p.entity_id && entIds.has(p.entity_id)));
  const propIds = new Set(props.map(p => p.id));
  const us = units.filter(u => propIds.has(u.property_id));
  const pipes = pipelines.filter(p => p.venture && v.pipelineVenture.includes(p.venture));
  const pipeIds = new Set(pipes.map(p => p.id));
  const sts = stages.filter(s => pipeIds.has(s.pipeline_id));
  const ds = deals.filter(d => pipeIds.has(d.pipeline_id));
  const dealIds = new Set(ds.map(d => d.id));
  const claimedElsewhere = new Set(VENTURES.filter(x => x.slug !== v.slug).flatMap(x => x.frontNames));
  const frs = fronts.filter(f => v.frontNames.includes(f.name)
    || (!claimedElsewhere.has(f.name) && !PERSONAL_FRONT_NAMES.includes(f.name) && f.entity_id && entIds.has(f.entity_id)));
  const frontIds = new Set(frs.map(f => f.id));
  const ts = tasks.filter(t => (t.front_id && frontIds.has(t.front_id)) || (t.record_type === "deal" && t.record_id && dealIds.has(t.record_id)));
  const acts = activities.filter(a => a.record_type === "deal" && dealIds.has(a.record_id));
  const contactIds = new Set(ds.map(d => d.primary_contact_id).filter(Boolean) as string[]);
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 12);
  const incomeT12 = tx.filter(t => t.amount > 0 && t.entity_id && entIds.has(t.entity_id) && new Date(t.posted_on) >= cutoff)
    .reduce((s, t) => s + Number(t.amount), 0);
  const open = ds.filter(d => d.status === "open");
  const stageById = new Map(sts.map(s => [s.id, s]));
  return {
    venture: v, fronts: frs, entities: ents, properties: props, units: us, pipelines: pipes, stages: sts,
    deals: ds, tasks: ts, activities: acts, contacts: contacts.filter(c => contactIds.has(c.id)),
    incomeT12,
    openValue: open.reduce((s, d) => s + Number(d.value), 0),
    weightedValue: open.reduce((s, d) => s + Number(d.value) * Number(stageById.get(d.stage_id ?? "")?.win_probability ?? 0), 0),
    occupied: us.filter(u => u.status === "occupied").length,
    totalUnits: us.length,
  };
}

export async function getAllVentureData(): Promise<VentureData[]> {
  return Promise.all(VENTURES.map(getVentureData));
}

/** Fronts not owned by any venture (degree, career). */
export async function getPersonalFronts(): Promise<T.Front[]> {
  const fronts = await getFronts();
  const owned = new Set(VENTURES.flatMap(v => v.frontNames));
  return fronts.filter(f => PERSONAL_FRONT_NAMES.includes(f.name) || !owned.has(f.name));
}
