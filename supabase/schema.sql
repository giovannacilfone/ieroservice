-- =====================================================================
-- Iero Service · Esquema del panel de administración
-- Pegar completo en Supabase → SQL Editor → New query → Run
-- =====================================================================

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  category text,
  contact text,
  phone text,
  email text,
  address text,
  notes text
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid references clients(id) on delete set null,
  scheduled_at timestamptz not null,
  appliance text,
  problem text,
  address text,
  status text not null default 'pendiente',
  notes text
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  body text,
  pinned boolean not null default false
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid references clients(id) on delete set null,
  title text not null,
  appliance text,
  done_at date default current_date,
  cost numeric,
  parts_cost numeric,
  description text,
  photos text[] not null default '{}'
);

-- ---------------------------------------------------------------------
-- Seguridad: solo usuarios logueados pueden leer y escribir.
-- Sin login (rol "anon") no se puede acceder a nada.
-- ---------------------------------------------------------------------
alter table clients   enable row level security;
alter table providers enable row level security;
alter table visits    enable row level security;
alter table notes     enable row level security;
alter table jobs      enable row level security;

create policy "admin clients"   on clients   for all to authenticated using (true) with check (true);
create policy "admin providers" on providers for all to authenticated using (true) with check (true);
create policy "admin visits"    on visits    for all to authenticated using (true) with check (true);
create policy "admin notes"     on notes     for all to authenticated using (true) with check (true);
create policy "admin jobs"      on jobs      for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- Fotos de trabajos: bucket PRIVADO (se ven con links firmados temporales)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('trabajos', 'trabajos', false)
on conflict (id) do nothing;

create policy "admin trabajos select" on storage.objects for select to authenticated using (bucket_id = 'trabajos');
create policy "admin trabajos insert" on storage.objects for insert to authenticated with check (bucket_id = 'trabajos');
create policy "admin trabajos update" on storage.objects for update to authenticated using (bucket_id = 'trabajos');
create policy "admin trabajos delete" on storage.objects for delete to authenticated using (bucket_id = 'trabajos');

-- ---------------------------------------------------------------------
-- Migración (solo si las tablas ya existían): gasto en repuestos por trabajo
-- ---------------------------------------------------------------------
alter table jobs add column if not exists parts_cost numeric;

-- Migración (solo si las tablas ya existían): dirección del proveedor
alter table providers add column if not exists address text;
