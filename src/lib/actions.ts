"use server";
// Server actions. In demo mode they mutate the in-memory store (lost on restart).
import { revalidatePath } from "next/cache";
import { serverClient } from "./supabase";
import { demo } from "./demo";

type Row = Record<string, unknown>;
const uid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

async function insert(tableName: keyof typeof demo, row: Row) {
  const sb = serverClient();
  if (sb) { const { error } = await sb.from(tableName).insert(row); if (error) throw new Error(error.message); return; }
  (demo[tableName] as unknown as Row[]).unshift({ id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...row });
}
async function update(tableName: keyof typeof demo, id: string, patch: Row) {
  const sb = serverClient();
  if (sb) { const { error } = await sb.from(tableName).update(patch).eq("id", id); if (error) throw new Error(error.message); return; }
  const rows = demo[tableName] as unknown as Row[];
  const i = rows.findIndex(r => r.id === id);
  if (i >= 0) rows[i] = { ...rows[i], ...patch, updated_at: new Date().toISOString() };
}

const str = (fd: FormData, k: string) => { const v = fd.get(k); return v === null || v === "" ? null : String(v); };
const num = (fd: FormData, k: string) => { const v = str(fd, k); return v == null ? null : Number(v); };

export async function createContact(fd: FormData) {
  const first = str(fd, "first_name"), last = str(fd, "last_name");
  await insert("contacts", {
    first_name: first, last_name: last, full_name: [first, last].filter(Boolean).join(" "),
    email: str(fd, "email"), phone: str(fd, "phone"), role: str(fd, "role"), source: str(fd, "source"),
    organization_id: str(fd, "organization_id"), tags: (str(fd, "tags") ?? "").split(",").map(s => s.trim()).filter(Boolean),
    dnc: false, notes: str(fd, "notes"),
  });
  revalidatePath("/people");
}

export async function createDeal(fd: FormData) {
  const pipeline_id = str(fd, "pipeline_id")!;
  const stage_id = str(fd, "stage_id") ?? demo.stages.find(s => s.pipeline_id === pipeline_id)?.id ?? null;
  await insert("deals", {
    title: str(fd, "title"), pipeline_id, stage_id, status: "open",
    primary_contact_id: str(fd, "primary_contact_id"), entity_id: str(fd, "entity_id"), front_id: str(fd, "front_id"),
    property_id: str(fd, "property_id"), value: num(fd, "value") ?? 0, expected_close: str(fd, "expected_close"),
    source: str(fd, "source"), offer_fields: {}, last_activity_at: new Date().toISOString(),
  });
  revalidatePath("/deals");
}

export async function moveDeal(id: string, stage_id: string) {
  await update("deals", id, { stage_id, last_activity_at: new Date().toISOString() });
  revalidatePath("/deals"); revalidatePath("/");
}

export async function createTask(fd: FormData) {
  await insert("tasks", {
    title: str(fd, "title"), status: "todo", priority: str(fd, "priority") ?? "normal", due_on: str(fd, "due_on"),
    front_id: str(fd, "front_id"), record_type: str(fd, "record_type"), record_id: str(fd, "record_id"), notes: str(fd, "notes"),
  });
  revalidatePath("/tasks"); revalidatePath("/");
}

export async function setTaskStatus(id: string, status: "todo" | "doing" | "done" | "cancelled") {
  await update("tasks", id, { status, completed_at: status === "done" ? new Date().toISOString() : null });
  revalidatePath("/tasks"); revalidatePath("/");
}

export async function addActivity(fd: FormData) {
  await insert("activities", {
    kind: str(fd, "kind") ?? "note", body: str(fd, "body"), record_type: str(fd, "record_type"), record_id: str(fd, "record_id"),
    contact_id: str(fd, "contact_id"), occurred_at: new Date().toISOString(),
  });
  if (str(fd, "record_type") === "deal") await update("deals", str(fd, "record_id")!, { last_activity_at: new Date().toISOString() });
  revalidatePath(`/deals/${str(fd, "record_id")}`); revalidatePath(`/people/${str(fd, "record_id")}`);
}

export async function upsertFront(fd: FormData) {
  const id = str(fd, "id");
  const row = {
    name: str(fd, "name"), rank: num(fd, "rank") ?? 100, status: str(fd, "status") ?? "active",
    current_state: str(fd, "current_state"), next_action: str(fd, "next_action"), why: str(fd, "why"),
    income_class: str(fd, "income_class"), entity_id: str(fd, "entity_id"), goal_id: str(fd, "goal_id"), place: str(fd, "place"),
  };
  if (id) await update("fronts", id, row); else await insert("fronts", row);
  revalidatePath("/"); revalidatePath("/fronts");
}

export async function upsertEntity(fd: FormData) {
  const id = str(fd, "id");
  const row = {
    name: str(fd, "name"), kind: str(fd, "kind") ?? "opco", parent_id: str(fd, "parent_id"), jurisdiction: str(fd, "jurisdiction"),
    ein: str(fd, "ein"), formed_on: str(fd, "formed_on"), registered_agent: str(fd, "registered_agent"),
    ownership_pct: num(fd, "ownership_pct") ?? 100, annual_filing_due: str(fd, "annual_filing_due"), notes: str(fd, "notes"),
  };
  if (id) await update("entities", id, row); else await insert("entities", row);
  revalidatePath("/entities");
}

export async function upsertAccount(fd: FormData) {
  const id = str(fd, "id");
  const kind = str(fd, "kind") ?? "checking";
  const row = { name: str(fd, "name"), kind, entity_id: str(fd, "entity_id"), institution: str(fd, "institution"), last4: str(fd, "last4"),
    balance: num(fd, "balance") ?? 0, floor_alert: num(fd, "floor_alert"), is_liability: ["credit", "loan", "mortgage"].includes(kind) };
  const sb = serverClient();
  if (sb) { const { is_liability: _drop, ...dbRow } = row; void _drop; if (id) await update("accounts", id, dbRow); else await insert("accounts", dbRow); }
  else if (id) await update("accounts", id, row); else await insert("accounts", row);
  revalidatePath("/money"); revalidatePath("/");
}

export async function upsertProperty(fd: FormData) {
  const id = str(fd, "id");
  const row = { address1: str(fd, "address1"), city: str(fd, "city"), state: str(fd, "state"), zip: str(fd, "zip"), entity_id: str(fd, "entity_id"),
    acquisition_method: str(fd, "acquisition_method"), acquired_on: str(fd, "acquired_on"), basis: num(fd, "basis"), current_value: num(fd, "current_value"),
    debt_balance: num(fd, "debt_balance") ?? 0, income_class: str(fd, "income_class"), use_tags: (str(fd, "use_tags") ?? "").split(",").map(s => s.trim()).filter(Boolean), notes: str(fd, "notes") };
  if (id) await update("properties", id, row); else await insert("properties", row);
  revalidatePath("/assets"); revalidatePath("/portfolio"); revalidatePath("/");
}

export async function upsertAsset(fd: FormData) {
  const id = str(fd, "id");
  const row = { name: str(fd, "name"), kind: str(fd, "kind") ?? "other", entity_id: str(fd, "entity_id"), acquisition_method: str(fd, "acquisition_method"),
    basis: num(fd, "basis"), current_value: num(fd, "current_value") ?? 0, debt_balance: num(fd, "debt_balance") ?? 0, income_class: str(fd, "income_class"), notes: str(fd, "notes") };
  if (id) await update("assets", id, row); else await insert("assets", row);
  revalidatePath("/assets"); revalidatePath("/");
}

export async function upsertGoal(fd: FormData) {
  const id = str(fd, "id");
  const row = { name: str(fd, "name"), parent_id: str(fd, "parent_id"), status: str(fd, "status") ?? "active", metric: str(fd, "metric"),
    target_value: num(fd, "target_value"), current_value: num(fd, "current_value") ?? 0, unit: str(fd, "unit"), horizon: str(fd, "horizon"), why: str(fd, "why"), sort: num(fd, "sort") ?? 0 };
  if (id) await update("goals", id, row); else await insert("goals", row);
  revalidatePath("/goals"); revalidatePath("/");
}

export async function setUnitStatus(id: string, status: string) {
  await update("units", id, { status, vacant_since: status === "vacant" ? new Date().toISOString().slice(0, 10) : null });
  revalidatePath("/portfolio"); revalidatePath("/");
}

export async function createTransaction(fd: FormData) {
  await insert("transactions", { account_id: str(fd, "account_id"), posted_on: str(fd, "posted_on") ?? new Date().toISOString().slice(0, 10),
    amount: num(fd, "amount") ?? 0, description: str(fd, "description"), income_class: str(fd, "income_class"), entity_id: str(fd, "entity_id"),
    category: str(fd, "category"), classified: !!str(fd, "income_class") });
  revalidatePath("/money"); revalidatePath("/");
}
