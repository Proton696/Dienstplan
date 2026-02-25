-- ============================================================
-- Dienstplan – Supabase Schema
-- Führe dieses Script im Supabase SQL Editor aus
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────
create type employee_role as enum ('employee', 'admin');
create type shift_type as enum ('frei', 'HO', 'Früh', 'Spät', 'Urlaub', 'MD');
create type swap_status as enum ('pending', 'approved', 'rejected');

-- ─── Tables ───────────────────────────────────────────────────────────────────

-- employees
create table if not exists public.employees (
  id        uuid primary key default uuid_generate_v4(),
  name      text not null,
  role      employee_role not null default 'employee',
  user_id   uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create unique index if not exists employees_user_id_idx on public.employees(user_id);

-- schedules
create table if not exists public.schedules (
  id           uuid primary key default uuid_generate_v4(),
  employee_id  uuid not null references public.employees(id) on delete cascade,
  date         date not null,
  shift_type   shift_type not null default 'frei',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  constraint schedules_employee_date_unique unique (employee_id, date)
);

create index if not exists schedules_date_idx on public.schedules(date);
create index if not exists schedules_employee_id_idx on public.schedules(employee_id);

-- shift_swap_requests
create table if not exists public.shift_swap_requests (
  id                uuid primary key default uuid_generate_v4(),
  from_employee_id  uuid not null references public.employees(id) on delete cascade,
  to_employee_id    uuid not null references public.employees(id) on delete cascade,
  from_date         date not null,
  to_date           date not null,
  status            swap_status not null default 'pending',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists swap_requests_from_emp_idx on public.shift_swap_requests(from_employee_id);
create index if not exists swap_requests_to_emp_idx on public.shift_swap_requests(to_employee_id);
create index if not exists swap_requests_status_idx on public.shift_swap_requests(status);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger schedules_updated_at
  before update on public.schedules
  for each row execute function public.set_updated_at();

create trigger swap_requests_updated_at
  before update on public.shift_swap_requests
  for each row execute function public.set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.employees enable row level security;
alter table public.schedules enable row level security;
alter table public.shift_swap_requests enable row level security;

-- Helper function: get current employee's role
create or replace function public.current_employee_role()
returns employee_role language sql security definer stable as $$
  select role from public.employees where user_id = auth.uid() limit 1;
$$;

-- Helper function: get current employee's id
create or replace function public.current_employee_id()
returns uuid language sql security definer stable as $$
  select id from public.employees where user_id = auth.uid() limit 1;
$$;

-- ─── employees RLS ────────────────────────────────────────────────────────────

-- All authenticated users can read all employees
create policy "employees: authenticated users can read"
  on public.employees for select
  to authenticated
  using (true);

-- Only admins can insert/update/delete
create policy "employees: admins can insert"
  on public.employees for insert
  to authenticated
  with check (public.current_employee_role() = 'admin');

create policy "employees: admins can update"
  on public.employees for update
  to authenticated
  using (public.current_employee_role() = 'admin');

create policy "employees: admins can delete"
  on public.employees for delete
  to authenticated
  using (public.current_employee_role() = 'admin');

-- ─── schedules RLS ────────────────────────────────────────────────────────────

-- All authenticated users can read all schedules
create policy "schedules: authenticated users can read"
  on public.schedules for select
  to authenticated
  using (true);

-- Only admins can insert schedules
create policy "schedules: admins can insert"
  on public.schedules for insert
  to authenticated
  with check (public.current_employee_role() = 'admin');

-- Only admins can update schedules
create policy "schedules: admins can update"
  on public.schedules for update
  to authenticated
  using (public.current_employee_role() = 'admin');

-- Only admins can delete schedules
create policy "schedules: admins can delete"
  on public.schedules for delete
  to authenticated
  using (public.current_employee_role() = 'admin');

-- ─── shift_swap_requests RLS ──────────────────────────────────────────────────

-- Employees can read their own swap requests; admins can read all
create policy "swap_requests: employees read own, admins read all"
  on public.shift_swap_requests for select
  to authenticated
  using (
    public.current_employee_role() = 'admin'
    or from_employee_id = public.current_employee_id()
    or to_employee_id = public.current_employee_id()
  );

-- Authenticated employees can create swap requests (for themselves)
create policy "swap_requests: employees can create"
  on public.shift_swap_requests for insert
  to authenticated
  with check (from_employee_id = public.current_employee_id());

-- Only admins can update (approve/reject) swap requests
create policy "swap_requests: admins can update"
  on public.shift_swap_requests for update
  to authenticated
  using (public.current_employee_role() = 'admin');

-- Only admins can delete
create policy "swap_requests: admins can delete"
  on public.shift_swap_requests for delete
  to authenticated
  using (public.current_employee_role() = 'admin');

-- ─── Seed Data ────────────────────────────────────────────────────────────────
-- ACHTUNG: Führe diesen Teil NACH dem Erstellen der Auth-User aus!
-- Ersetze die user_id UUIDs mit den echten IDs aus deinem Supabase Auth-Dashboard.

/*
insert into public.employees (name, role, user_id) values
  ('Maik',    'employee', 'REPLACE_WITH_MAIK_USER_ID'),
  ('Timon',   'employee', 'REPLACE_WITH_TIMON_USER_ID'),
  ('Niklas',  'employee', 'REPLACE_WITH_NIKLAS_USER_ID'),
  ('Emanuel', 'employee', 'REPLACE_WITH_EMANUEL_USER_ID'),
  ('Henning', 'employee', 'REPLACE_WITH_HENNING_USER_ID'),
  ('Laurens', 'employee', 'REPLACE_WITH_LAURENS_USER_ID'),
  ('Rayene',  'employee', 'REPLACE_WITH_RAYENE_USER_ID'),
  ('Natan',   'employee', 'REPLACE_WITH_NATAN_USER_ID'),
  ('Mathias', 'admin',    'REPLACE_WITH_MATHIAS_USER_ID');
*/
