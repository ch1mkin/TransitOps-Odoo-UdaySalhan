-- TransitOps: allow role edits from Supabase Table Editor / SQL
-- Run after 002_profiles_rls.sql
-- Then run 006_profile_role_enum.sql for a role dropdown in Table Editor.
--
-- Valid role values:
--   fleet_manager | dispatcher | safety_officer | financial_analyst

-- Remove app-only role switcher if a prior version was applied
drop function if exists public.set_my_profile_role(text);

-- Keep updated_at fresh; do not block role column edits in Supabase
create or replace function public.profiles_prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
