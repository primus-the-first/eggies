-- Run this in your Supabase SQL editor

-- ── User profiles (standalone — no Supabase Auth dependency) ────────────────────
create table profiles (
  id        bigserial primary key,              -- auto-increment: 1, 2, 3…
  name      text not null unique,
  password  text not null,                      -- plain-text (no hashing)
  role      text not null default 'seller' check (role in ('super_admin', 'seller')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Allow all" on profiles for all using (true) with check (true);

-- Seed users directly:
-- insert into profiles (name, password, role) values
--   ('Primus', 'your-password-here', 'super_admin'),
--   ('Araba',  'her-password-here',  'seller');

-- ── Audit log ─────────────────────────────────────────────────────────────────
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  actor_id bigint references profiles(id) on delete set null,
  actor_name text not null,
  action text not null,   -- 'price_updated' | 'stock_received' | 'sale_recorded' | ...
  details jsonb default '{}'
);

alter table audit_logs enable row level security;
create policy "Allow all" on audit_logs for all using (true) with check (true);

create table sales (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  quantity integer not null,
  size text check (size in ('small', 'large')),
  price_per_egg numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cash', 'momo')),
  note text
);

create table credit_customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  phone text,
  type text not null default 'individual' check (type in ('individual', 'business'))
);

create table credit_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  customer_id uuid not null references credit_customers(id) on delete cascade,
  type text not null check (type in ('delivery', 'payment')),
  quantity integer,
  crates integer,
  size text check (size in ('small', 'large')),
  price_per_crate numeric(10,2),
  amount numeric(10,2) not null,
  note text
);

create table inventory_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text not null check (type in ('received', 'broken', 'discarded')),
  quantity integer not null,
  size text check (size in ('small', 'large')),      -- set for 'received' entries
  price_per_crate numeric(10,2),                     -- price at time of stock-in
  note text
);

create table prices (
  id uuid primary key default gen_random_uuid(),
  size text not null unique check (size in ('small', 'large')),
  label text not null,
  amount numeric(10,2) not null,
  updated_at timestamptz default now()
);

-- Seed default prices
insert into prices (size, label, amount) values
  ('small', 'Small', 50),
  ('large', 'Large', 55);

-- Price history: log every price change for auditing / reporting
create table price_history (
  id uuid primary key default gen_random_uuid(),
  changed_at timestamptz default now(),
  size text not null check (size in ('small', 'large')),
  amount numeric(10,2) not null
);

-- Seed history to match the initial prices
insert into price_history (size, amount) values
  ('small', 50),
  ('large', 55);

-- Enable Row Level Security (open policy for single-user app)
alter table sales enable row level security;
alter table credit_customers enable row level security;
alter table credit_transactions enable row level security;
alter table inventory_entries enable row level security;
alter table prices enable row level security;
alter table price_history enable row level security;

create policy "Allow all" on sales for all using (true) with check (true);
create policy "Allow all" on credit_customers for all using (true) with check (true);
create policy "Allow all" on credit_transactions for all using (true) with check (true);
create policy "Allow all" on inventory_entries for all using (true) with check (true);
create policy "Allow all" on prices for all using (true) with check (true);
create policy "Allow all" on price_history for all using (true) with check (true);

-- ── MIGRATION (run this if the DB already exists) ─────────────────────────────
-- create table if not exists price_history (
--   id uuid primary key default gen_random_uuid(),
--   changed_at timestamptz default now(),
--   size text not null check (size in ('small', 'large')),
--   amount numeric(10,2) not null
-- );
-- alter table price_history enable row level security;
-- create policy "Allow all" on price_history for all using (true) with check (true);
-- insert into price_history (size, amount) select size, amount from prices;

-- Add size + price columns to existing inventory_entries table:
-- alter table inventory_entries add column if not exists size text check (size in ('small', 'large'));
-- alter table inventory_entries add column if not exists price_per_crate numeric(10,2);

