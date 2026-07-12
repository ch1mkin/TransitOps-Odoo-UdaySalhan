-- TransitOps: maintenance, fuel, expenses tables + seed
-- Run after 004_fleet_rls_trips_seed.sql

create table if not exists public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id),
  maintenance_type text not null,
  description text not null,
  cost numeric not null default 0,
  service_center text not null,
  status text not null check (status in ('In Progress', 'Completed')),
  opened_at date not null,
  closed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fuel_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id),
  trip_id uuid references public.trips (id),
  liters numeric not null,
  cost numeric not null,
  odometer integer not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id),
  trip_id uuid references public.trips (id),
  category text not null,
  amount numeric not null,
  description text not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.maintenance_logs enable row level security;
alter table public.fuel_logs enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "authenticated_read_maintenance" on public.maintenance_logs;
drop policy if exists "fleet_manager_write_maintenance" on public.maintenance_logs;
drop policy if exists "authenticated_read_fuel" on public.fuel_logs;
drop policy if exists "fleet_finance_write_fuel" on public.fuel_logs;
drop policy if exists "authenticated_read_expenses" on public.expenses;
drop policy if exists "fleet_finance_write_expenses" on public.expenses;

create policy "authenticated_read_maintenance"
  on public.maintenance_logs for select to authenticated using (true);

create policy "fleet_manager_write_maintenance"
  on public.maintenance_logs for all to authenticated
  using (public.current_user_role() = 'fleet_manager')
  with check (public.current_user_role() = 'fleet_manager');

create policy "authenticated_read_fuel"
  on public.fuel_logs for select to authenticated using (true);

create policy "fleet_finance_write_fuel"
  on public.fuel_logs for all to authenticated
  using (public.current_user_role() in ('fleet_manager', 'financial_analyst'))
  with check (public.current_user_role() in ('fleet_manager', 'financial_analyst'));

create policy "authenticated_read_expenses"
  on public.expenses for select to authenticated using (true);

create policy "fleet_finance_write_expenses"
  on public.expenses for all to authenticated
  using (public.current_user_role() in ('fleet_manager', 'financial_analyst'))
  with check (public.current_user_role() in ('fleet_manager', 'financial_analyst'));

grant select, insert, update, delete on public.maintenance_logs to authenticated;
grant select, insert, update, delete on public.fuel_logs to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;

insert into public.maintenance_logs (
  vehicle_id, maintenance_type, description, cost, service_center, status, opened_at
)
select veh.id, v.maintenance_type, v.description, v.cost, v.service_center, v.status, v.opened_at::date
from (
  values
    ('KA-05-EF-9012', 'Engine Service', 'Full engine overhaul and oil change', 42000, 'Tata Authorised · Bangalore', 'In Progress', '2026-07-08'),
    ('MH-12-AB-1234', 'Tyre Replacement', '6 tyres replaced — MRF ZLX', 28500, 'MRF Fitment · Pune', 'Completed', '2026-06-22'),
    ('DL-01-CD-5678', 'Brake Service', 'Brake pad and drum inspection', 12400, 'Ashok Leyland · Chandigarh', 'In Progress', '2026-07-10')
) as v(reg_no, maintenance_type, description, cost, service_center, status, opened_at)
join public.vehicles veh on veh.registration_number = v.reg_no
on conflict do nothing;

insert into public.fuel_logs (vehicle_id, liters, cost, odometer, date)
select veh.id, v.liters, v.cost, v.odometer, v.log_date::date
from (
  values
    ('DL-01-CD-5678', 180, 16200, 51980, '2026-07-11'),
    ('MH-12-AB-1234', 220, 19800, 84010, '2026-07-09'),
    ('GJ-27-GH-3344', 150, 13500, 67120, '2026-07-07'),
    ('UP-32-MN-8899', 260, 23400, 90950, '2026-07-11')
) as v(reg_no, liters, cost, odometer, log_date)
join public.vehicles veh on veh.registration_number = v.reg_no
on conflict do nothing;

insert into public.expenses (vehicle_id, category, amount, description, date)
select veh.id, v.category, v.amount, v.description, v.expense_date::date
from (
  values
    ('DL-01-CD-5678', 'Tolls', 2400, 'Mumbai–Pune highway tolls', '2026-07-11'),
    ('KA-05-EF-9012', 'Repairs', 8500, 'Brake pad replacement', '2026-07-08'),
    ('MH-12-AB-1234', 'Permits', 12000, 'Interstate permit renewal', '2026-07-05'),
    ('UP-32-MN-8899', 'Tolls', 4800, 'Delhi–Jaipur expressway', '2026-07-10')
) as v(reg_no, category, amount, description, expense_date)
join public.vehicles veh on veh.registration_number = v.reg_no
on conflict do nothing;
