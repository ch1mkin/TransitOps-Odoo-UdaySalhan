-- TransitOps: email OTP codes for login and registration verification
-- Run after 012_vehicle_photos_trip_tracking.sql

create table if not exists public.auth_otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  purpose text not null check (purpose in ('login', 'register')),
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_otp_codes_lookup_idx
  on public.auth_otp_codes (email, purpose, created_at desc);

alter table public.auth_otp_codes enable row level security;

-- No policies: only the service role client should read or write OTP rows.
