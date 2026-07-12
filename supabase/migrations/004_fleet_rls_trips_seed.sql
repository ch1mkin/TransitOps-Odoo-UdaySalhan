-- TransitOps: fleet write RLS, updated_at triggers, trip seed
-- Run AFTER 003_fleet_seed.sql has already completed successfully.
--
-- If you see: policy "authenticated_read_vehicles" already exists
-- → 003 is already applied. Run ONLY this file (do not re-run 003).

-- Role helper for RLS (reads caller's profile role)
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Shared updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

drop trigger if exists drivers_set_updated_at on public.drivers;
create trigger drivers_set_updated_at
  before update on public.drivers
  for each row execute function public.set_updated_at();

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

-- Table grants (RLS still applies)
grant select, insert, update, delete on public.vehicles to authenticated;
grant select, insert, update, delete on public.drivers to authenticated;
grant select, insert, update, delete on public.trips to authenticated;

-- Vehicles: fleet_manager full write
drop policy if exists "fleet_manager_insert_vehicles" on public.vehicles;
drop policy if exists "fleet_manager_update_vehicles" on public.vehicles;
drop policy if exists "fleet_manager_delete_vehicles" on public.vehicles;

create policy "fleet_manager_insert_vehicles"
  on public.vehicles for insert to authenticated
  with check (public.current_user_role() = 'fleet_manager');

create policy "fleet_manager_update_vehicles"
  on public.vehicles for update to authenticated
  using (public.current_user_role() = 'fleet_manager')
  with check (public.current_user_role() = 'fleet_manager');

create policy "fleet_manager_delete_vehicles"
  on public.vehicles for delete to authenticated
  using (public.current_user_role() = 'fleet_manager');

-- Drivers: fleet_manager write; safety_officer can update
drop policy if exists "fleet_manager_insert_drivers" on public.drivers;
drop policy if exists "fleet_manager_update_drivers" on public.drivers;
drop policy if exists "fleet_manager_delete_drivers" on public.drivers;
drop policy if exists "safety_officer_update_drivers" on public.drivers;

create policy "fleet_manager_insert_drivers"
  on public.drivers for insert to authenticated
  with check (public.current_user_role() = 'fleet_manager');

create policy "fleet_manager_update_drivers"
  on public.drivers for update to authenticated
  using (public.current_user_role() = 'fleet_manager')
  with check (public.current_user_role() = 'fleet_manager');

create policy "fleet_manager_delete_drivers"
  on public.drivers for delete to authenticated
  using (public.current_user_role() = 'fleet_manager');

create policy "safety_officer_update_drivers"
  on public.drivers for update to authenticated
  using (public.current_user_role() = 'safety_officer')
  with check (public.current_user_role() = 'safety_officer');

-- Trips: fleet_manager + dispatcher write
drop policy if exists "fleet_dispatch_insert_trips" on public.trips;
drop policy if exists "fleet_dispatch_update_trips" on public.trips;
drop policy if exists "fleet_dispatch_delete_trips" on public.trips;

create policy "fleet_dispatch_insert_trips"
  on public.trips for insert to authenticated
  with check (
    public.current_user_role() in ('fleet_manager', 'dispatcher')
  );

create policy "fleet_dispatch_update_trips"
  on public.trips for update to authenticated
  using (public.current_user_role() in ('fleet_manager', 'dispatcher'))
  with check (public.current_user_role() in ('fleet_manager', 'dispatcher'));

create policy "fleet_dispatch_delete_trips"
  on public.trips for delete to authenticated
  using (public.current_user_role() in ('fleet_manager', 'dispatcher'));

-- Seed trips (linked to seeded vehicles/drivers by business keys)
insert into public.trips (
  trip_number, source, destination, vehicle_id, driver_id,
  cargo_weight, planned_distance, status, dispatch_time
)
select
  v.trip_number, v.source, v.destination, veh.id, drv.id,
  v.cargo_weight, v.planned_distance, v.status, v.dispatch_time::timestamptz
from (
  values
    ('TR-1042', 'Mumbai', 'Pune', 'DL-01-CD-5678', 'MH-2020-884521', 14500, 148, 'Dispatched', '2026-07-12 06:30:00+00'),
    ('TR-1043', 'Delhi', 'Jaipur', 'MH-12-AB-1234', 'DL-2019-772103', 18200, 280, 'Draft', null),
    ('TR-1044', 'Bangalore', 'Chennai', 'GJ-27-GH-3344', 'GJ-2021-551902', 12000, 346, 'Completed', '2026-07-10 04:00:00+00'),
    ('TR-1046', 'Hyderabad', 'Vijayawada', 'UP-32-MN-8899', 'TS-2022-441287', 21000, 275, 'Dispatched', '2026-07-12 05:00:00+00'),
    ('TR-1047', 'Kolkata', 'Bhubaneswar', 'WB-19-OP-2233', 'RJ-2020-118903', 11500, 440, 'Draft', null),
    ('TR-1048', 'Chandigarh', 'Ludhiana', 'RJ-14-KL-5566', 'GJ-2021-551902', 8900, 95, 'Completed', '2026-07-09 07:00:00+00')
) as v(trip_number, source, destination, reg_no, license_no, cargo_weight, planned_distance, status, dispatch_time)
join public.vehicles veh on veh.registration_number = v.reg_no
join public.drivers drv on drv.license_number = v.license_no
on conflict (trip_number) do nothing;
