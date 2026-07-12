-- TransitOps: driver identity documents + mobile QR upload sessions
-- Run after 009_trip_updates_notifications_storage.sql

create table if not exists public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers (id) on delete cascade,
  document_type text not null,
  file_name text not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists driver_documents_driver_id_idx on public.driver_documents (driver_id);

alter table public.driver_documents enable row level security;

drop policy if exists "authenticated_read_driver_documents" on public.driver_documents;
drop policy if exists "safety_officer_write_driver_documents" on public.driver_documents;

create policy "authenticated_read_driver_documents"
  on public.driver_documents for select
  to authenticated
  using (true);

create policy "safety_officer_write_driver_documents"
  on public.driver_documents for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'safety_officer'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'safety_officer'
    )
  );

create table if not exists public.driver_upload_sessions (
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

create index if not exists driver_upload_sessions_token_idx on public.driver_upload_sessions (token);

alter table public.driver_upload_sessions enable row level security;

drop policy if exists "safety_officer_manage_upload_sessions" on public.driver_upload_sessions;

create policy "safety_officer_manage_upload_sessions"
  on public.driver_upload_sessions for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'safety_officer'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'safety_officer'
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'driver-documents',
  'driver-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "driver_docs_storage_read" on storage.objects;
drop policy if exists "driver_docs_storage_insert" on storage.objects;
drop policy if exists "driver_docs_storage_delete" on storage.objects;

create policy "driver_docs_storage_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'driver-documents');

create policy "driver_docs_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'driver-documents'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'safety_officer'
    )
  );

create policy "driver_docs_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'driver-documents'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'safety_officer'
    )
  );
