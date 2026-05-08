-- Run this in your Supabase SQL editor

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

-- Enable Row Level Security (open policy for single-user app)
alter table sales enable row level security;
alter table credit_customers enable row level security;
alter table credit_transactions enable row level security;
alter table inventory_entries enable row level security;
alter table prices enable row level security;

create policy "Allow all" on sales for all using (true) with check (true);
create policy "Allow all" on credit_customers for all using (true) with check (true);
create policy "Allow all" on credit_transactions for all using (true) with check (true);
create policy "Allow all" on inventory_entries for all using (true) with check (true);
create policy "Allow all" on prices for all using (true) with check (true);
