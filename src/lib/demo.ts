// In-memory demo store used when Supabase env vars are absent.
// Mirrors supabase/migrations/0002_seed.sql plus a few sample records so every screen renders.
import type * as T from "./types";

const E = {
  holdco: "11111111-1111-1111-1111-111111111101",
  snowbook: "11111111-1111-1111-1111-111111111102",
  vog: "11111111-1111-1111-1111-111111111103",
  bxb: "11111111-1111-1111-1111-111111111104",
  terralift: "11111111-1111-1111-1111-111111111105",
  dj: "11111111-1111-1111-1111-111111111106",
  nonprofit: "11111111-1111-1111-1111-111111111107",
  brightpath: "11111111-1111-1111-1111-111111111108",
  personal: "11111111-1111-1111-1111-111111111109",
};
const G = { nw: "g1", abi: "g2", degree: "g3", sales: "g4" };
const P = { tlacq: "p1", tldispo: "p2", cozowners: "p3", cozbook: "p4", vog: "p5", know: "p6" };

const now = new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();
const dateIn = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

function stages(pid: string, names: [string, number][]): T.PipelineStage[] {
  return names.map(([name, p], i) => ({ id: `${pid}-s${i + 1}`, pipeline_id: pid, name, sort: i + 1, win_probability: p, is_terminal: i === names.length - 1 }));
}

export const demo = {
  roles: [
    { id: "r1", name: "Husband & father", commitment: "Present, provider, steward of the household", sort: 1 },
    { id: "r2", name: "Operator", commitment: "Cozii, Valley of Grace, TerraLift, Salvo — BOI converted into ABI", sort: 2 },
    { id: "r3", name: "Student", commitment: "Finish the degree sprint; certs that articulate", sort: 3 },
    { id: "r4", name: "Veteran & CVOR tech", commitment: "The W2 that funds the transition; medical-device sales next", sort: 4 },
    { id: "r5", name: "Steward", commitment: "From Self-Made to God-Led — the frame the numbers answer to", sort: 5 },
  ] as T.Role[],

  entities: [
    { id: E.holdco, name: "Wyoming Holdco", kind: "holdco", parent_id: null, jurisdiction: "WY", ein: null, formed_on: null, registered_agent: null, ownership_pct: 100, annual_filing_due: dateIn(40), notes: "Top of the structure (name TBD)" },
    { id: E.snowbook, name: "Snowbook Properties LLC", kind: "propco", parent_id: E.holdco, jurisdiction: "NV", ein: null, formed_on: null, registered_agent: null, ownership_pct: 100, annual_filing_due: dateIn(18), notes: "PropCo over Valley of Grace" },
    { id: E.vog, name: "Valley of Grace Recovery Home LLC", kind: "opco", parent_id: E.snowbook, jurisdiction: "NV", ein: null, formed_on: null, registered_agent: null, ownership_pct: 100, annual_filing_due: null, notes: "Level 2 recovery residence, North Las Vegas" },
    { id: E.bxb, name: "BXB International", kind: "opco", parent_id: E.holdco, jurisdiction: "AZ", ein: null, formed_on: null, registered_agent: null, ownership_pct: 100, annual_filing_due: null, notes: "Cozii Housing — Phoenix Metro MTR" },
    { id: E.terralift, name: "TerraLift", kind: "opco", parent_id: E.holdco, jurisdiction: "AZ", ein: null, formed_on: null, registered_agent: null, ownership_pct: 100, annual_filing_due: null, notes: "Vacant land wholesaling, 12-state buy-box" },
    { id: E.dj, name: "DJ Assets LLC", kind: "propco", parent_id: E.holdco, jurisdiction: "WY", ein: null, formed_on: null, registered_agent: null, ownership_pct: 100, annual_filing_due: null, notes: "Asset holding" },
    { id: E.nonprofit, name: "Financial Literacy Nonprofit", kind: "nonprofit", parent_id: null, jurisdiction: "AZ", ein: null, formed_on: null, registered_agent: null, ownership_pct: 0, annual_filing_due: null, notes: "501(c)(3) — course delivery" },
    { id: E.brightpath, name: "BrightPath Real Estate Solutions, LLC", kind: "opco", parent_id: null, jurisdiction: "AZ", ein: null, formed_on: null, registered_agent: null, ownership_pct: 100, annual_filing_due: null, notes: "LOI buyer entity used by Salvo" },
    { id: E.personal, name: "Personal", kind: "personal", parent_id: null, jurisdiction: "AZ", ein: null, formed_on: null, registered_agent: null, ownership_pct: 100, annual_filing_due: null, notes: "Bryan & Stephanie" },
  ] as T.Entity[],

  accounts: [
    { id: "a1", entity_id: E.personal, name: "Personal checking", kind: "checking", institution: "—", last4: null, balance: 12400, is_liability: false, floor_alert: 5000 },
    { id: "a2", entity_id: E.bxb, name: "BXB operating", kind: "checking", institution: "—", last4: null, balance: 8200, is_liability: false, floor_alert: 3000 },
    { id: "a3", entity_id: E.vog, name: "Valley of Grace operating", kind: "checking", institution: "—", last4: null, balance: 3100, is_liability: false, floor_alert: 2000 },
    { id: "a4", entity_id: E.personal, name: "Credit card", kind: "credit", institution: "—", last4: null, balance: 2600, is_liability: true, floor_alert: null },
  ] as T.Account[],

  properties: [
    { id: "pr1", address1: "Valley of Grace house", city: "North Las Vegas", state: "NV", zip: null, entity_id: E.snowbook, acquisition_method: "lease_option", acquired_on: null, basis: 0, current_value: 0, debt_balance: 0, income_class: "BOI", use_tags: ["valley_of_grace"], notes: "R-1 zoning, 5bd/3ba model" },
    { id: "pr2", address1: "Cozii MTR unit 1", city: "Phoenix", state: "AZ", zip: null, entity_id: E.bxb, acquisition_method: "other", acquired_on: null, basis: 0, current_value: 0, debt_balance: 0, income_class: "BOI", use_tags: ["cozii"], notes: "Co-hosted / arbitrage" },
  ] as T.Property[],

  assets: [
    { id: "as1", name: "GPU rig (RTX 5070 Ti)", kind: "equipment", entity_id: E.personal, acquisition_method: "cash", basis: 2500, current_value: 2000, debt_balance: 0, income_class: "KBI", notes: "ComfyUI / local AI" },
    { id: "as2", name: "Salvo (product + codebase)", kind: "digital_product", entity_id: E.terralift, acquisition_method: "built", basis: 0, current_value: 0, debt_balance: 0, income_class: "KBI", notes: "$97/mo tool, $497 Launch, $499/mo Managed" },
    { id: "as3", name: "MTR toolkit", kind: "digital_product", entity_id: E.bxb, acquisition_method: "built", basis: 0, current_value: 0, debt_balance: 0, income_class: "KBI", notes: "$27 front end → $147 upsell" },
  ] as T.Asset[],

  units: [
    { id: "u1", property_id: "pr1", name: "Room 1 – Bed A", kind: "bed", status: "vacant", target_rate: 900, vacant_since: daysAgo(12).slice(0, 10) },
    { id: "u2", property_id: "pr1", name: "Room 1 – Bed B", kind: "bed", status: "vacant", target_rate: 900, vacant_since: daysAgo(12).slice(0, 10) },
    { id: "u3", property_id: "pr1", name: "Room 2 – Bed A", kind: "bed", status: "in_acquisition", target_rate: 900, vacant_since: null },
    { id: "u4", property_id: "pr2", name: "Whole unit", kind: "door", status: "occupied", target_rate: 3200, vacant_since: null },
  ] as T.Unit[],

  goals: [
    { id: G.nw, name: "$30M net worth by 30", parent_id: null, status: "active", metric: "net_worth", target_value: 30000000, current_value: 0, unit: "USD", horizon: null, why: "The number the whole structure serves", sort: 1 },
    { id: G.abi, name: "Replace W2 with property management income", parent_id: G.nw, status: "active", metric: "abi_monthly", target_value: 8000, current_value: 0, unit: "USD/mo", horizon: null, why: "ABI is the exit from labor income", sort: 2 },
    { id: G.degree, name: "Finish bachelor's degree", parent_id: null, status: "active", metric: "courses_done", target_value: 12, current_value: 3, unit: "Sophia courses", horizon: null, why: "Credential for the sales transition", sort: 3 },
    { id: G.sales, name: "Move into medical-device sales", parent_id: null, status: "active", metric: "milestone", target_value: 1, current_value: 0, unit: "", horizon: null, why: "Leverages CVOR background; better LI while BOI→ABI matures", sort: 4 },
  ] as T.Goal[],

  fronts: [
    { id: "f1", name: "Valley of Grace launch", rank: 1, status: "active", current_state: "Beds, house manager, referrals", next_action: "Hire house manager; work referral list", why: "Fulfillment first, income second", income_class: "BOI", entity_id: E.vog, goal_id: G.abi, place: "North Las Vegas, NV", updated_at: now },
    { id: "f2", name: "Cozii owner acquisition", rank: 2, status: "active", current_state: "Lead-source list 8/17 signed up", next_action: "Finish platform signups; book discovery calls", why: "Property management is the W2 replacement", income_class: "BOI", entity_id: E.bxb, goal_id: G.abi, place: "Phoenix Metro, AZ", updated_at: now },
    { id: "f3", name: "Salvo build & launch", rank: 3, status: "active", current_state: "Engine unified; landing page live; PDF pending", next_action: "Ship in-app LOI PDF; founding-25 cohort", why: "KBI that funds ABI", income_class: "KBI", entity_id: E.terralift, goal_id: null, place: "Remote / 12-state buy-box", updated_at: now },
    { id: "f4", name: "MTR toolkit ($27 → $147)", rank: 4, status: "active", current_state: "Assets gathered from MTR Resources", next_action: "Package front-end product", why: "KBI, low effort, reuses Cozii assets", income_class: "KBI", entity_id: E.bxb, goal_id: null, place: "Online", updated_at: now },
    { id: "f5", name: "Degree sprint", rank: 5, status: "active", current_state: "Sophia gen-eds in progress", next_action: "Verify Sophia→WGU articulations; order JST", why: "Credential for sales transition", income_class: "LI", entity_id: E.personal, goal_id: G.degree, place: "Online", updated_at: now },
    { id: "f6", name: "Medical-device sales transition", rank: 6, status: "active", current_state: "Exploring", next_action: "Build target list of device companies in Phoenix", why: "Higher LI while ABI compounds", income_class: "LI", entity_id: E.personal, goal_id: G.sales, place: "Phoenix Metro, AZ", updated_at: now },
    { id: "f7", name: "ADU/casita buy-and-hold", rank: 7, status: "parked", current_state: "Buy-box set: $400–550k, mid-tier+, any 2nd unit", next_action: "Find capital partner for entry + furnishing", why: "Direct ABI; Cozii feeds it", income_class: "ABI", entity_id: E.bxb, goal_id: G.nw, place: "Phoenix Metro, AZ", updated_at: now },
  ] as T.Front[],

  pipelines: [
    { id: P.tlacq, slug: "tl-acq", name: "TerraLift — Acquisition", venture: "terralift", sort: 1 },
    { id: P.tldispo, slug: "tl-dispo", name: "TerraLift — Disposition", venture: "terralift", sort: 2 },
    { id: P.cozowners, slug: "cozii-owners", name: "Cozii — Owner Acquisition", venture: "cozii", sort: 3 },
    { id: P.cozbook, slug: "cozii-bookings", name: "Cozii — Bookings", venture: "cozii", sort: 4 },
    { id: P.vog, slug: "vog-intake", name: "Valley of Grace — Intake", venture: "valley_of_grace", sort: 5 },
    { id: P.know, slug: "knowledge", name: "Knowledge Products", venture: "knowledge", sort: 6 },
  ] as T.Pipeline[],

  stages: [
    ...stages(P.tlacq, [["List imported", 0.02], ["Underwritten", 0.05], ["LOI sent", 0.08], ["Response", 0.2], ["Negotiation", 0.4], ["Under contract", 0.8], ["Assigned / Closed", 1]]),
    ...stages(P.tldispo, [["Buyer sourced", 0.1], ["Matched to deal", 0.3], ["Offer out", 0.6], ["Closed", 1]]),
    ...stages(P.cozowners, [["Lead", 0.05], ["Discovery call booked", 0.2], ["Proposal sent", 0.4], ["Agreement signed", 0.9], ["Onboarding", 0.95], ["Live", 1]]),
    ...stages(P.cozbook, [["Inquiry", 0.1], ["Quoted", 0.3], ["Held", 0.6], ["Confirmed", 0.95], ["Checked in", 1], ["Checked out", 1]]),
    ...stages(P.vog, [["Referral received", 0.2], ["Screened", 0.4], ["Interviewed", 0.6], ["Bed offered", 0.8], ["Moved in", 1], ["Discharged", 1]]),
    ...stages(P.know, [["Lead", 0.05], ["Front-end bought", 0.5], ["Upsold", 0.8], ["Managed / Subscribed", 1]]),
  ] as T.PipelineStage[],

  organizations: [
    { id: "o1", name: "CRS Temporary Housing", kind: "relocation network", website: null, phone: null, notes: null },
    { id: "o2", name: "ALE Solutions", kind: "insurance housing", website: null, phone: null, notes: null },
    { id: "o3", name: "Furnished Finder", kind: "MTR platform", website: null, phone: null, notes: null },
    { id: "o4", name: "Sedgwick (tacares.com)", kind: "insurance housing", website: null, phone: null, notes: null },
    { id: "o5", name: "Dabella Consulting", kind: "consulting", website: null, phone: null, notes: null },
  ] as T.Organization[],

  contacts: [
    { id: "c1", first_name: "Sample", last_name: "Seller", full_name: "Sample Seller", email: "seller@example.com", phone: "602-555-0101", organization_id: null, role: "seller", tags: ["propstream", "creative"], source: "salvo", dnc: false, notes: "Example record — replace", created_at: daysAgo(9) },
    { id: "c2", first_name: "Sample", last_name: "Agent", full_name: "Sample Agent", email: "agent@example.com", phone: "480-555-0102", organization_id: null, role: "agent", tags: ["mls"], source: "salvo", dnc: false, notes: null, created_at: daysAgo(20) },
    { id: "c3", first_name: "Sample", last_name: "Owner", full_name: "Sample Owner", email: "owner@example.com", phone: "623-555-0103", organization_id: null, role: "owner", tags: ["mtr"], source: "referral", dnc: false, notes: "Has a casita in Peoria", created_at: daysAgo(4) },
    { id: "c4", first_name: "Sample", last_name: "Referral", full_name: "Sample Referral", email: null, phone: "702-555-0104", organization_id: null, role: "referral source", tags: ["vog"], source: "network", dnc: false, notes: "Case manager", created_at: daysAgo(30) },
  ] as T.Contact[],

  deals: [
    { id: "d1", title: "Sample creative LOI — Glendale", pipeline_id: P.tlacq, stage_id: `${P.tlacq}-s3`, status: "open", property_id: null, primary_contact_id: "c2", entity_id: E.brightpath, front_id: "f3", value: 18000, expected_close: dateIn(45), offer_fields: { price: 385000, down: 30000, financed: 120000, payment: 333 }, source: "salvo", last_activity_at: daysAgo(3), created_at: daysAgo(9) },
    { id: "d2", title: "Sample cash LOI — Pinal County lot", pipeline_id: P.tlacq, stage_id: `${P.tlacq}-s4`, status: "open", property_id: null, primary_contact_id: "c1", entity_id: E.terralift, front_id: "f3", value: 9000, expected_close: dateIn(30), offer_fields: { cash: 42000 }, source: "salvo", last_activity_at: daysAgo(16), created_at: daysAgo(25) },
    { id: "d3", title: "Peoria casita — co-host agreement", pipeline_id: P.cozowners, stage_id: `${P.cozowners}-s2`, status: "open", property_id: null, primary_contact_id: "c3", entity_id: E.bxb, front_id: "f2", value: 6000, expected_close: dateIn(21), offer_fields: {}, source: "referral", last_activity_at: daysAgo(1), created_at: daysAgo(4) },
    { id: "d4", title: "Intake — referral from case manager", pipeline_id: P.vog, stage_id: `${P.vog}-s2`, status: "open", property_id: "pr1", primary_contact_id: "c4", entity_id: E.vog, front_id: "f1", value: 900, expected_close: dateIn(7), offer_fields: {}, source: "network", last_activity_at: daysAgo(2), created_at: daysAgo(5) },
  ] as T.Deal[],

  tasks: [
    { id: "t1", title: "Hire house manager", status: "todo", priority: "urgent", due_on: dateIn(5), front_id: "f1", record_type: "front", record_id: "f1", notes: null },
    { id: "t2", title: "Finish Furnished Finder / Allthathousing signups", status: "doing", priority: "high", due_on: dateIn(3), front_id: "f2", record_type: "front", record_id: "f2", notes: null },
    { id: "t3", title: "Follow up on Glendale LOI", status: "todo", priority: "normal", due_on: dateIn(-2), front_id: "f3", record_type: "deal", record_id: "d1", notes: null },
    { id: "t4", title: "Verify Sophia→WGU articulations", status: "todo", priority: "high", due_on: dateIn(10), front_id: "f5", record_type: "goal", record_id: G.degree, notes: null },
    { id: "t5", title: "Order JST transcript", status: "todo", priority: "normal", due_on: dateIn(14), front_id: "f5", record_type: "goal", record_id: G.degree, notes: null },
    { id: "t6", title: "Wyoming holdco annual report", status: "todo", priority: "normal", due_on: dateIn(40), front_id: null, record_type: "entity", record_id: E.holdco, notes: null },
  ] as T.Task[],

  activities: [
    { id: "ac1", kind: "email", body: "Creative + cash LOI sent via Salvo blast", record_type: "deal", record_id: "d1", contact_id: "c2", occurred_at: daysAgo(9) },
    { id: "ac2", kind: "call", body: "Agent asked for the AITD terms in writing", record_type: "deal", record_id: "d1", contact_id: "c2", occurred_at: daysAgo(3) },
    { id: "ac3", kind: "call", body: "Discovery call booked for next week", record_type: "deal", record_id: "d3", contact_id: "c3", occurred_at: daysAgo(1) },
    { id: "ac4", kind: "note", body: "Referral received; screening call set", record_type: "deal", record_id: "d4", contact_id: "c4", occurred_at: daysAgo(2) },
  ] as T.Activity[],

  transactions: (() => {
    const rows: T.Transaction[] = [];
    for (let m = 0; m < 12; m++) {
      const d = new Date(); d.setMonth(d.getMonth() - m); const posted_on = d.toISOString().slice(0, 10);
      rows.push({ id: `tx-li-${m}`, account_id: "a1", posted_on, amount: 5200, description: "Banner Health payroll", income_class: "LI", entity_id: E.personal, category: "W2", classified: true });
      rows.push({ id: `tx-si-${m}`, account_id: "a1", posted_on, amount: 1400, description: "GI Bill MHA", income_class: "SI", entity_id: E.personal, category: "Benefit", classified: true });
      if (m < 8) rows.push({ id: `tx-boi-${m}`, account_id: "a2", posted_on, amount: 1100 + m * 60, description: "Cozii MTR net", income_class: "BOI", entity_id: E.bxb, category: "MTR", classified: true });
      if (m < 5) rows.push({ id: `tx-kbi-${m}`, account_id: "a2", posted_on, amount: 300 + m * 40, description: "Fiverr / digital", income_class: "KBI", entity_id: E.bxb, category: "Digital", classified: true });
      if (m < 3) rows.push({ id: `tx-abi-${m}`, account_id: "a2", posted_on, amount: 250, description: "Casita rent share", income_class: "ABI", entity_id: E.bxb, category: "Rent", classified: true });
    }
    return rows;
  })(),
};

export type DemoStore = typeof demo;
