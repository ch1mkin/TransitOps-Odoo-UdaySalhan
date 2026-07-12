-- TransitOps: vehicle photos, trip GPS tracking
-- Run after 011_vehicle_upload_sessions.sql

alter table public.vehicles
  add column if not exists photo_storage_path text;

alter table public.trips
  add column if not exists tracking_token text unique;

create table if not exists public.trip_locations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  accuracy numeric,
  recorded_at timestamptz not null default now()
);

create index if not exists trip_locations_trip_id_recorded_idx
  on public.trip_locations (trip_id, recorded_at desc);

alter table public.trip_locations enable row level security;

drop policy if exists "authenticated_read_trip_locations" on public.trip_locations;

create policy "authenticated_read_trip_locations"
  on public.trip_locations for select
  to authenticated
  using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-photos',
  'vehicle-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "vehicle_photos_storage_read" on storage.objects;
drop policy if exists "vehicle_photos_storage_insert" on storage.objects;
drop policy if exists "vehicle_photos_storage_delete" on storage.objects;

create policy "vehicle_photos_storage_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'vehicle-photos');

create policy "vehicle_photos_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-photos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'fleet_manager'
    )
  );

create policy "vehicle_photos_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'fleet_manager'
    )
  );
