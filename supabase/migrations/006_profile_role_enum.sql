-- TransitOps: profiles.role as enum → dropdown in Supabase Table Editor
-- Run after 005_profile_role_switcher.sql

do $$
begin
  create type public.user_role as enum (
    'fleet_manager',
    'dispatcher',
    'safety_officer',
    'financial_analyst'
  );
exception
  when duplicate_object then null;
end $$;

-- Convert text + check constraint → enum (skip if already migrated)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
      and udt_name = 'text'
  ) then
    alter table public.profiles drop constraint if exists profiles_role_check;

    alter table public.profiles
      alter column role type public.user_role
      using role::public.user_role;
  end if;
end $$;

-- Signup trigger must write enum values
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.user_role;
begin
  begin
    assigned_role := coalesce(
      new.raw_user_meta_data->>'role',
      'fleet_manager'
    )::public.user_role;
  exception
    when invalid_text_representation then
      assigned_role := 'fleet_manager';
  end;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    assigned_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Fleet RLS helper: compare enum to text literals
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid();
$$;
