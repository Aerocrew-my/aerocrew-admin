-- Admin identities are created in auth.users by a trusted operator. This table
-- grants portal access; no browser-facing policy permits changing authorisation.
create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin', 'operations_admin', 'dispatcher', 'support')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;

revoke all on table public.admin_profiles from anon;
revoke insert, update, delete on table public.admin_profiles from authenticated;
grant select on table public.admin_profiles to authenticated;

drop policy if exists "Admins can read their own profile" on public.admin_profiles;
create policy "Admins can read their own profile"
  on public.admin_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

comment on table public.admin_profiles is
  'Server-checked AeroCrew portal authorisation. Provision only through trusted Supabase administration.';
