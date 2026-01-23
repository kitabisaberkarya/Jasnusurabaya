```sql
-- =================================================================
-- UPDATE SCHEMA - MASTER DATA KORWIL
-- Description: Menambahkan tabel untuk manajemen dinamis wilayah
-- =================================================================

-- 1. Tabel Korwils
create table if not exists public.korwils (
  id bigint primary key generated always as identity,
  name text not null unique,
  created_at text default to_char(now(), 'YYYY-MM-DD')
);

-- 2. Security Policies (RLS)
alter table public.korwils enable row level security;

-- Reset Policy
drop policy if exists "Public Read Korwils" on public.korwils;
drop policy if exists "Admin Manage Korwils" on public.korwils;

-- Public can Read
create policy "Public Read Korwils" on public.korwils for select using (true);

-- Admin can CRUD
create policy "Admin Manage Korwils" on public.korwils for all using (true) with check (true);

-- 3. Seeding Data Awal (Sesuai konstanta aplikasi sebelumnya)
insert into public.korwils (name) values 
('Kalirungkut'), ('Rungkut Kidul'), ('Pandugo'), ('Kedung Asem'), ('Kedung Baruk'),
('Wonorejo'), ('Medokan Ayu'), ('Rungkut Tengah'), ('Rungkut Menanggal'), ('Tenggilis Mejoyo'),
('Rungkut Mejoyo'), ('Kutisari'), ('Penjaringan Sari'), ('Gunung Anyar Kidul'), ('Gunung Anyar Tengah'),
('Gunung Anyar Tambak'), ('Kenjeran + Tmbk Wedi'), ('Tambaksari'), ('Panjang Jiwo'), ('Bakung')
on conflict (name) do nothing;
```