-- TransitOps: trip updates, notifications, vehicle document storage
-- Run after 008_vehicle_documents.sql

-- Trip activity log
create table if not exists public.trip_updates (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists trip_updates_trip_id_idx on public.trip_updates (trip_id);
create index if not exists trip_updates_created_at_idx on public.trip_updates (created_at desc);

alter table public.trip_updates enable row level security;

drop policy if exists "authenticated_read_trip_updates" on public.trip_updates;
drop policy if exists "authenticated_insert_trip_updates" on public.trip_updates;

create policy "authenticated_read_trip_updates"
  on public.trip_updates for select
  to authenticated
  using (true);

create policy "authenticated_insert_trip_updates"
  on public.trip_updates for insert
  to authenticated
  with check (true);

-- In-app notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_unread_idx on public.notifications (user_id, read_at);

alter table public.notifications enable row level security;

drop policy if exists "users_read_own_notifications" on public.notifications;
drop policy if exists "users_update_own_notifications" on public.notifications;
drop policy if exists "authenticated_insert_notifications" on public.notifications;

create policy "users_read_own_notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "users_update_own_notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "authenticated_insert_notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

-- Vehicle document storage path
alter table public.vehicle_documents
  add column if not exists storage_path text;

-- Supabase Storage bucket for vehicle documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-documents',
  'vehicle-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "vehicle_docs_storage_read" on storage.objects;
drop policy if exists "vehicle_docs_storage_insert" on storage.objects;
drop policy if exists "vehicle_docs_storage_delete" on storage.objects;

create policy "vehicle_docs_storage_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'vehicle-documents');

create policy "vehicle_docs_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-documents'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'fleet_manager'
    )
  );

create policy "vehicle_docs_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vehicle-documents'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'fleet_manager'
    )
  );
