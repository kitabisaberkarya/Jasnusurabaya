
-- =================================================================
-- MAINTENANCE & AUDIT LOGS SCHEMA
-- Description: Tabel ini disiapkan untuk mencatat aktivitas maintenance
-- manual oleh admin, seperti kapan terakhir kali backup dilakukan
-- atau kapan konfigurasi sistem diubah.
-- =================================================================

-- 1. Create Maintenance Logs Table
create table if not exists public.maintenance_logs (
  id bigint primary key generated always as identity,
  admin_id bigint references public.users(id),
  action_type text not null, -- 'BACKUP', 'RESTORE', 'CONFIG_CHANGE', 'SECURITY_AUDIT'
  description text,
  ip_address text,
  status text default 'SUCCESS',
  created_at timestamp with time zone default now()
);

-- 2. Security Policies (RLS)
alter table public.maintenance_logs enable row level security;

-- Admin Only Access
create policy "Admin View Logs" on public.maintenance_logs
  for select
  using (true); -- Dalam implementasi nyata, filter by role admin

create policy "Admin Insert Logs" on public.maintenance_logs
  for insert
  with check (true);

-- 3. Example Usage (Manual Insert)
-- insert into public.maintenance_logs (admin_id, action_type, description)
-- values (1, 'BACKUP', 'Manual Check performed via Admin Dashboard');
