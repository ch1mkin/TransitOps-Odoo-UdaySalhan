-- TransitOps: fleet tables + seed data (run after 001_profiles.sql)
-- Profiles for all roles: register demo accounts in the app (see MOCK_DEMO_ACCOUNTS in lib/mock-data)

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique,
  vehicle_name text not null,
  vehicle_model text not null,
  vehicle_type text not null,
  max_load_capacity integer not null,
  odometer integer not null default 0,
  acquisition_cost numeric not null default 0,
  status text not null check (status in ('Available', 'On Trip', 'In Shop', 'Retired')),
  purchase_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  license_number text not null unique,
  license_category text not null,
  license_expiry date not null,
  phone text not null,
  email text not null,
  safety_score integer not null check (safety_score between 0 and 100),
  status text not null check (status in ('Available', 'On Trip', 'Off Duty', 'Suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  trip_number text not null unique,
  source text not null,
  destination text not null,
  vehicle_id uuid references public.vehicles (id),
  driver_id uuid references public.drivers (id),
  cargo_weight integer not null,
  planned_distance integer not null,
  actual_distance integer,
  fuel_used numeric,
  revenue numeric,
  status text not null check (status in ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
  dispatch_time timestamptz,
  completion_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;
alter table public.drivers enable row level security;
alter table public.trips enable row level security;

drop policy if exists "authenticated_read_vehicles" on public.vehicles;
drop policy if exists "authenticated_read_drivers" on public.drivers;
drop policy if exists "authenticated_read_trips" on public.trips;

create policy "authenticated_read_vehicles" on public.vehicles for select to authenticated using (true);
create policy "authenticated_read_drivers" on public.drivers for select to authenticated using (true);
create policy "authenticated_read_trips" on public.trips for select to authenticated using (true);

-- Seed vehicles (skip if already seeded)
insert into public.vehicles (registration_number, vehicle_name, vehicle_model, vehicle_type, max_load_capacity, odometer, acquisition_cost, status, purchase_date)
values
  ('MH-12-AB-1234', 'Fleet Hauler 01', 'Tata Prima 5530', 'Heavy Truck', 25000, 84200, 2850000, 'Available', '2022-03-15'),
  ('DL-01-CD-5678', 'City Runner', 'Ashok Leyland 4218', 'Medium Truck', 16000, 52100, 2100000, 'On Trip', '2021-08-22'),
  ('KA-05-EF-9012', 'South Express', 'Mahindra Blazo X', 'Heavy Truck', 22000, 118400, 2650000, 'In Shop', '2020-11-10'),
  ('GJ-27-GH-3344', 'Gujarat Carrier', 'Eicher Pro 6035', 'Medium Truck', 18000, 67300, 1950000, 'Available', '2023-01-05'),
  ('TN-09-IJ-7788', 'Southern Haul', 'Tata LPT 4225', 'Heavy Truck', 24000, 29100, 1780000, 'Retired', '2018-06-18'),
  ('RJ-14-KL-5566', 'Desert Runner', 'BharatBenz 5528', 'Heavy Truck', 26000, 44500, 3100000, 'Available', '2023-06-12'),
  ('UP-32-MN-8899', 'North Star', 'Volvo FM 460', 'Heavy Truck', 28000, 91200, 4200000, 'On Trip', '2021-02-28'),
  ('WB-19-OP-2233', 'Eastern Freight', 'Tata Signa 4018', 'Medium Truck', 17000, 38700, 2050000, 'Available', '2024-01-20')
on conflict (registration_number) do nothing;

insert into public.drivers (name, license_number, license_category, license_expiry, phone, email, safety_score, status)
values
  ('Rajesh Kumar', 'MH-2020-884521', 'HMV', '2027-04-12', '+91 98765 43210', 'rajesh.kumar@transitops.in', 92, 'On Trip'),
  ('Amit Singh', 'DL-2019-772103', 'HMV', '2026-09-30', '+91 98112 33445', 'amit.singh@transitops.in', 88, 'Available'),
  ('Suresh Patel', 'GJ-2021-551902', 'HMV', '2028-02-18', '+91 99088 77665', 'suresh.patel@transitops.in', 95, 'Available'),
  ('Vikram Reddy', 'KA-2018-339014', 'HMV', '2025-12-01', '+91 98450 11223', 'vikram.reddy@transitops.in', 76, 'Suspended'),
  ('Mohammed Irfan', 'TS-2022-441287', 'HMV', '2029-01-15', '+91 97001 55667', 'irfan.m@transitops.in', 91, 'On Trip'),
  ('Deepak Joshi', 'RJ-2020-118903', 'HMV', '2027-08-22', '+91 98291 77884', 'deepak.j@transitops.in', 84, 'Off Duty')
on conflict (license_number) do nothing;

-- Demo role accounts (register via app auth with these emails):
-- fleet.manager@transitops.demo  → fleet_manager
-- dispatcher@transitops.demo     → dispatcher
-- safety@transitops.demo         → safety_officer
-- finance@transitops.demo        → financial_analyst
