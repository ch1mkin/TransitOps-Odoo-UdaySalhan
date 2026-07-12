-- TransitOps: vehicle documents metadata table
-- Run after 007_ops_tables.sql

create table if not exists public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  document_type text not null,
  file_name text not null,
  expiry_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_documents enable row level security;

drop policy if exists "authenticated_read_vehicle_documents" on public.vehicle_documents;
drop policy if exists "fleet_manager_write_vehicle_documents" on public.vehicle_documents;

create policy "authenticated_read_vehicle_documents"
  on public.vehicle_documents for select
  to authenticated
  using (true);

create policy "fleet_manager_write_vehicle_documents"
  on public.vehicle_documents for all
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

insert into public.vehicle_documents (vehicle_id, document_type, file_name, expiry_date, notes)
select
  v.id,
  d.document_type,
  d.file_name,
  d.expiry_date::date,
  d.notes
from public.vehicles v
cross join lateral (
  values
    ('Registration Certificate', v.registration_number || '-RC.pdf', (current_date + interval '2 years')::date, 'Original RC'),
    ('Insurance', v.registration_number || '-INS.pdf', (current_date + interval '1 year')::date, 'Comprehensive policy'),
    ('Fitness Certificate', v.registration_number || '-FIT.pdf', (current_date + interval '6 months')::date, 'Annual fitness')
) as d(document_type, file_name, expiry_date, notes)
where v.status != 'Retired';
