-- BXB Command Center — Phase 0 schema
-- Run in Supabase SQL editor or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type income_class as enum ('SI','LI','BOI','ABI','KBI');
create type entity_kind as enum ('holdco','propco','opco','nonprofit','personal','other');
create type asset_kind as enum ('property','vehicle','account','equipment','digital_product','ip','other');
create type acquisition_method as enum ('cash','conventional','creative','subject_to','lease_option','seller_finance','inherited','built','other');
create type account_kind as enum ('checking','savings','credit','loan','mortgage','brokerage','retirement','other');
create type unit_kind as enum ('door','bed','casita','room','lot','other');
create type unit_status as enum ('occupied','vacant','turning','offline','in_acquisition');
create type occupancy_kind as enum ('booking','lease','resident_stay');
create type deal_status as enum ('open','won','lost','stalled');
create type task_status as enum ('todo','doing','done','cancelled');
create type task_priority as enum ('low','normal','high','urgent');
create type activity_kind as enum ('note','call','sms','email','meeting','system');
create type goal_status as enum ('active','achieved','paused','dropped');
create type front_status as enum ('active','parked','done');

-- ---------- identity / orientation ----------
create table roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  commitment text,
  sort int default 0,
  created_at timestamptz default now()
);

create table fronts ( -- "what am I working on" — ranked active fronts
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rank int not null default 100,
  status front_status not null default 'active',
  current_state text,
  next_action text,
  why text,                          -- why it is on the list
  income_class income_class,
  entity_id uuid,
  goal_id uuid,
  place text,                        -- where: Phoenix, North Las Vegas, 12-state buy-box…
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ---------- entities & money ----------
create table entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind entity_kind not null default 'opco',
  parent_id uuid references entities(id) on delete set null,
  jurisdiction text,
  ein text,
  formed_on date,
  registered_agent text,
  ownership_pct numeric(5,2) default 100,
  annual_filing_due date,
  notes text,
  created_at timestamptz default now()
);
alter table fronts add constraint fronts_entity_fk foreign key (entity_id) references entities(id) on delete set null;

create table accounts (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete set null,
  name text not null,
  kind account_kind not null,
  institution text,
  last4 text,
  balance numeric(14,2) default 0,      -- positive = asset, positive on loan/credit = liability amount
  is_liability boolean generated always as (kind in ('credit','loan','mortgage')) stored,
  floor_alert numeric(14,2),
  plaid_item_id text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text,          -- brokerage, referral agency, relocation network, lender, vendor, platform
  website text,
  phone text,
  notes text,
  created_at timestamptz default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  full_name text generated always as (trim(coalesce(first_name,'') || ' ' || coalesce(last_name,''))) stored,
  email text,
  phone text,
  organization_id uuid references organizations(id) on delete set null,
  role text,          -- seller, agent, owner, tenant, resident, referral source, contractor, lender, student
  tags text[] default '{}',
  source text,
  dnc boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index contacts_email_idx on contacts (lower(email));
create index contacts_phone_idx on contacts (phone);

create table properties (
  id uuid primary key default gen_random_uuid(),
  address1 text not null,
  city text, state text, zip text, county text,
  apn text,
  lat numeric(9,6), lng numeric(9,6),
  entity_id uuid references entities(id) on delete set null,
  acquisition_method acquisition_method,
  acquired_on date,
  basis numeric(14,2),
  current_value numeric(14,2),
  debt_balance numeric(14,2) default 0,
  income_class income_class,
  use_tags text[] default '{}',       -- cozii, valley_of_grace, terralift, development
  notes text,
  created_at timestamptz default now()
);

create table assets ( -- non-property assets; properties are assets too via a view
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind asset_kind not null,
  entity_id uuid references entities(id) on delete set null,
  acquisition_method acquisition_method,
  acquired_on date,
  basis numeric(14,2),
  current_value numeric(14,2) default 0,
  debt_balance numeric(14,2) default 0,
  income_class income_class,
  notes text,
  created_at timestamptz default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  name text not null,
  kind unit_kind not null default 'door',
  status unit_status not null default 'vacant',
  target_rate numeric(10,2),
  rate_period text default 'month',
  vacant_since date,
  created_at timestamptz default now()
);

-- ---------- pipelines & deals ----------
create table pipelines (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  venture text,        -- terralift, cozii, valley_of_grace, knowledge
  sort int default 0
);
create table pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references pipelines(id) on delete cascade,
  name text not null,
  sort int not null,
  win_probability numeric(4,3) default 0.1,
  is_terminal boolean default false
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pipeline_id uuid not null references pipelines(id),
  stage_id uuid references pipeline_stages(id),
  status deal_status not null default 'open',
  property_id uuid references properties(id) on delete set null,
  primary_contact_id uuid references contacts(id) on delete set null,
  entity_id uuid references entities(id) on delete set null,
  front_id uuid references fronts(id) on delete set null,
  value numeric(14,2) default 0,
  expected_close date,
  offer_fields jsonb default '{}',   -- Salvo push lands here: price, down, financed, payment, etc.
  source text,                       -- salvo, referral, platform:furnishedfinder…
  last_activity_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index deals_pipeline_stage_idx on deals (pipeline_id, stage_id) where status='open';

create table deal_contacts (
  deal_id uuid references deals(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  role text,
  primary key (deal_id, contact_id)
);

create table occupancies (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  kind occupancy_kind not null,
  starts_on date not null,
  ends_on date,
  rate numeric(10,2),
  rate_period text default 'month',
  deal_id uuid references deals(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

-- ---------- money ----------
create table transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete set null,
  posted_on date not null,
  amount numeric(14,2) not null,      -- +income / -expense
  description text,
  income_class income_class,
  entity_id uuid references entities(id) on delete set null,
  property_id uuid references properties(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  category text,
  classified boolean default false,
  external_id text unique,
  created_at timestamptz default now()
);
create index transactions_posted_idx on transactions (posted_on desc);

create table classification_rules (
  id uuid primary key default gen_random_uuid(),
  match_text text not null,          -- ILIKE pattern against description
  income_class income_class,
  entity_id uuid references entities(id) on delete set null,
  category text,
  sort int default 0
);

-- ---------- goals ----------
create table goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references goals(id) on delete cascade,
  status goal_status not null default 'active',
  metric text,                       -- net_worth, abi_monthly, doors, deals_closed, courses_done…
  target_value numeric(16,2),
  current_value numeric(16,2) default 0,
  unit text,
  horizon date,
  why text,
  sort int default 0,
  created_at timestamptz default now()
);
alter table fronts add constraint fronts_goal_fk foreign key (goal_id) references goals(id) on delete set null;

create table milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  name text not null,
  due_on date,
  done boolean default false,
  sort int default 0
);

-- ---------- tasks, activity, documents (polymorphic) ----------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status task_status not null default 'todo',
  priority task_priority not null default 'normal',
  due_on date,
  front_id uuid references fronts(id) on delete set null,
  record_type text,                  -- deal, contact, property, entity, goal, unit…
  record_id uuid,
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now()
);
create index tasks_record_idx on tasks (record_type, record_id);
create index tasks_due_idx on tasks (due_on) where status in ('todo','doing');

create table activities (
  id uuid primary key default gen_random_uuid(),
  kind activity_kind not null default 'note',
  body text,
  record_type text not null,
  record_id uuid not null,
  contact_id uuid references contacts(id) on delete set null,
  occurred_at timestamptz default now(),
  created_at timestamptz default now()
);
create index activities_record_idx on activities (record_type, record_id, occurred_at desc);

create table documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  storage_path text,
  url text,
  record_type text,
  record_id uuid,
  version int default 1,
  created_at timestamptz default now()
);

-- ---------- rollup views ----------
create view v_net_worth as
select
  coalesce((select sum(current_value - coalesce(debt_balance,0)) from properties),0)
+ coalesce((select sum(current_value - coalesce(debt_balance,0)) from assets),0)
+ coalesce((select sum(case when is_liability then -balance else balance end) from accounts),0) as net_worth,
  coalesce((select sum(balance) from accounts where kind in ('checking','savings')),0) as liquid_cash,
  coalesce((select sum(balance) from accounts where is_liability),0)
+ coalesce((select sum(debt_balance) from properties),0)
+ coalesce((select sum(debt_balance) from assets),0) as total_debt;

create view v_income_by_class_t12 as
select income_class, sum(amount) as total
from transactions
where amount > 0 and posted_on >= (current_date - interval '12 months')
group by income_class;

create view v_pipeline_summary as
select p.slug, p.name as pipeline, s.name as stage, s.sort,
       count(d.id) as deals, coalesce(sum(d.value),0) as value,
       coalesce(sum(d.value * s.win_probability),0) as weighted
from pipelines p
join pipeline_stages s on s.pipeline_id = p.id
left join deals d on d.stage_id = s.id and d.status='open'
group by p.slug, p.name, p.sort, s.name, s.sort
order by p.sort, s.sort;

create view v_portfolio as
select
  count(*) filter (where status='occupied') as occupied,
  count(*) filter (where status='vacant') as vacant,
  count(*) filter (where status='turning') as turning,
  count(*) filter (where status='in_acquisition') as in_acquisition,
  count(*) as total
from units;

-- ---------- touch triggers ----------
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger deals_touch before update on deals for each row execute function touch_updated_at();
create trigger contacts_touch before update on contacts for each row execute function touch_updated_at();
create trigger fronts_touch before update on fronts for each row execute function touch_updated_at();

create or replace function stamp_deal_activity() returns trigger language plpgsql as $$
begin
  if new.record_type = 'deal' then
    update deals set last_activity_at = now() where id = new.record_id;
  end if;
  return new;
end $$;
create trigger activities_stamp_deal after insert on activities for each row execute function stamp_deal_activity();

-- ---------- RLS (single-owner: any authenticated user = owner) ----------
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname='public' loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "owner_all" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
