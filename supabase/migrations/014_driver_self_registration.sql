-- TransitOps: driver self-registration invites + pending approval status
-- Run after 013_auth_otp_codes.sql

alter table public.drivers
  drop constraint if exists drivers_status_check;

alter table public.drivers
  add constraint drivers_status_check
    check (status in ('Pending Approval', 'Available', 'On Trip', 'Off Duty', 'Suspended'));

alter table public.drivers
  add column if not exists registration_source text not null default 'operator'
    check (registration_source in ('operator', 'self')),
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles (id) on delete set null;

create table if not exists public.driver_registration_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  status text not null default 'waiting'
    check (status in ('waiting', 'submitted', 'approved', 'rejected', 'expired')),
  driver_id uuid references public.drivers (id) on delete set null,
  expires_at timestamptz not null,
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index if not exists driver_registration_invites_token_idx
  on public.driver_registration_invites (token);

create index if not exists driver_registration_invites_status_idx
  on public.driver_registration_invites (status);

alter table public.driver_registration_invites enable row level security;

drop policy if exists "safety_officer_manage_driver_registration_invites"
  on public.driver_registration_invites;

create policy "safety_officer_manage_driver_registration_invites"
  on public.driver_registration_invites for all
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
