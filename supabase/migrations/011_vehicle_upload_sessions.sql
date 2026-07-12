-- TransitOps: vehicle document QR upload sessions (mobile handoff)
-- Run after 010_driver_documents.sql

create table if not exists public.vehicle_upload_sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  document_type text not null,
  status text not null default 'waiting',
  temp_storage_path text,
  file_name text,
  mime_type text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists vehicle_upload_sessions_token_idx on public.vehicle_upload_sessions (token);

alter table public.vehicle_upload_sessions enable row level security;

drop policy if exists "fleet_manager_manage_vehicle_upload_sessions" on public.vehicle_upload_sessions;

create policy "fleet_manager_manage_vehicle_upload_sessions"
  on public.vehicle_upload_sessions for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'fleet_manager'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'fleet_manager'
    )
  );
