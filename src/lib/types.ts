export type IncomeClass = "SI" | "LI" | "BOI" | "ABI" | "KBI";
export const INCOME_CLASS_LABEL: Record<IncomeClass, string> = {
  SI: "Structural / Benefits",
  LI: "Labor",
  BOI: "Business Operating",
  ABI: "Asset-Backed",
  KBI: "Knowledge-Based",
};

export interface Role { id: string; name: string; commitment: string | null; sort: number }

export interface Front {
  id: string; name: string; rank: number; status: "active" | "parked" | "done";
  current_state: string | null; next_action: string | null; why: string | null;
  income_class: IncomeClass | null; entity_id: string | null; goal_id: string | null;
  place: string | null; updated_at: string;
}

export interface Entity {
  id: string; name: string; kind: "holdco" | "propco" | "opco" | "nonprofit" | "personal" | "other";
  parent_id: string | null; jurisdiction: string | null; ein: string | null; formed_on: string | null;
  registered_agent: string | null; ownership_pct: number; annual_filing_due: string | null; notes: string | null;
}

export interface Account {
  id: string; entity_id: string | null; name: string; kind: string; institution: string | null;
  last4: string | null; balance: number; is_liability: boolean; floor_alert: number | null;
}

export interface Property {
  id: string; address1: string; city: string | null; state: string | null; zip: string | null;
  entity_id: string | null; acquisition_method: string | null; acquired_on: string | null;
  basis: number | null; current_value: number | null; debt_balance: number; income_class: IncomeClass | null;
  use_tags: string[]; notes: string | null;
}

export interface Asset {
  id: string; name: string; kind: string; entity_id: string | null; acquisition_method: string | null;
  basis: number | null; current_value: number; debt_balance: number; income_class: IncomeClass | null; notes: string | null;
}

export interface Unit {
  id: string; property_id: string; name: string; kind: string;
  status: "occupied" | "vacant" | "turning" | "offline" | "in_acquisition";
  target_rate: number | null; vacant_since: string | null;
}

export interface Goal {
  id: string; name: string; parent_id: string | null; status: "active" | "achieved" | "paused" | "dropped";
  metric: string | null; target_value: number | null; current_value: number; unit: string | null;
  horizon: string | null; why: string | null; sort: number;
}

export interface Organization { id: string; name: string; kind: string | null; website: string | null; phone: string | null; notes: string | null }

export interface Contact {
  id: string; first_name: string | null; last_name: string | null; full_name: string;
  email: string | null; phone: string | null; organization_id: string | null; role: string | null;
  tags: string[]; source: string | null; dnc: boolean; notes: string | null; created_at: string;
}

export interface Pipeline { id: string; slug: string; name: string; venture: string | null; sort: number }
export interface PipelineStage { id: string; pipeline_id: string; name: string; sort: number; win_probability: number; is_terminal: boolean }

export interface Deal {
  id: string; title: string; pipeline_id: string; stage_id: string | null;
  status: "open" | "won" | "lost" | "stalled"; property_id: string | null; primary_contact_id: string | null;
  entity_id: string | null; front_id: string | null; value: number; expected_close: string | null;
  offer_fields: Record<string, unknown>; source: string | null; last_activity_at: string; created_at: string;
}

export interface Task {
  id: string; title: string; status: "todo" | "doing" | "done" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent"; due_on: string | null; front_id: string | null;
  record_type: string | null; record_id: string | null; notes: string | null;
}

export interface Activity {
  id: string; kind: "note" | "call" | "sms" | "email" | "meeting" | "system"; body: string | null;
  record_type: string; record_id: string; contact_id: string | null; occurred_at: string;
}

export interface Transaction {
  id: string; account_id: string | null; posted_on: string; amount: number; description: string | null;
  income_class: IncomeClass | null; entity_id: string | null; category: string | null; classified: boolean;
}

export interface NetWorth { net_worth: number; liquid_cash: number; total_debt: number }
export interface Portfolio { occupied: number; vacant: number; turning: number; in_acquisition: number; total: number }
export interface PipelineSummaryRow { slug: string; pipeline: string; stage: string; sort: number; deals: number; value: number; weighted: number }
