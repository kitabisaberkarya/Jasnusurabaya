```sql
-- =================================================================
-- MASTER DATABASE SCHEMA - JAMIYAH SHOLAWAT NARIYAH (JSN)
-- Platform: Supabase (PostgreSQL)
-- Description: Script ini telah diperbarui agar aman dijalankan berulang kali (Idempotent).
-- =================================================================

-- -----------------------------------------------------------------
-- MENU: AUTH & DATABASE ANGGOTA
-- -----------------------------------------------------------------

-- 1. Tabel Users
create table if not exists public.users (
  id bigint primary key generated always as identity,
  name text not null,
  email text,
  role text default 'member',
  status text default 'active',
  nia text unique,
  password text not null,
  wilayah text,
  phone text,
  joined_at text default to_char(now(), 'YYYY-MM-DD')
);

-- 2. Tabel Registrations
create table if not exists public.registrations (
  id bigint primary key generated always as identity,
  name text not null,
  nik text,
  email text,
  phone text,
  address text,
  wilayah text,
  password text,
  status text default 'pending',
  date text default to_char(now(), 'YYYY-MM-DD')
);

-- -----------------------------------------------------------------
-- MENU: MANAJEMEN BERITA
-- -----------------------------------------------------------------

-- 3. Tabel News
create table if not exists public.news (
  id bigint primary key generated always as identity,
  title text not null,
  excerpt text,
  content text,
  date text default to_char(now(), 'YYYY-MM-DD'),
  image_url text
);

-- -----------------------------------------------------------------
-- MENU: GALERI KEGIATAN
-- -----------------------------------------------------------------

-- 4. Tabel Gallery
create table if not exists public.gallery (
  id bigint primary key generated always as identity,
  type text default 'image',
  url text,
  caption text
);

-- -----------------------------------------------------------------
-- MENU: ABSENSI MAJELIS
-- -----------------------------------------------------------------

-- 5. Tabel Attendance Sessions
create table if not exists public.attendance_sessions (
  id bigint primary key generated always as identity,
  name text not null,
  date text default to_char(now(), 'YYYY-MM-DD'),
  is_open boolean default true,
  attendees jsonb default '[]'::jsonb
);

-- 6. Tabel Attendance Records
create table if not exists public.attendance_records (
  id text primary key,
  session_id bigint references public.attendance_sessions(id),
  user_id bigint references public.users(id),
  user_name text,
  timestamp text,
  photo_url text,
  location text
);

-- -----------------------------------------------------------------
-- MENU: PENGATURAN
-- -----------------------------------------------------------------

-- 7. Tabel Site Config
create table if not exists public.site_config (
  id bigint primary key generated always as identity,
  app_name text,
  org_name text,
  description text,
  address text,
  email text,
  phone text,
  logo_url text
);

-- =================================================================
-- SEEDING DATA (Data Awal)
-- Menggunakan 'ON CONFLICT' atau cek eksistensi agar tidak duplikat
-- =================================================================

-- 1. Buat Akun Super Admin
insert into public.users (name, email, role, status, nia, password, wilayah, joined_at)
values 
('Administrator JSN', 'jasnu.nariyahsurabaya@gmail.com', 'admin', 'active', 'ADMIN-MASTER', 'JasnuNariyahSurabaya1926', 'Pusat', '2024-01-01')
on conflict (nia) do nothing;

-- 2. Setup Konfigurasi Default (Hanya jika tabel kosong)
insert into public.site_config (app_name, org_name, description, address, email, phone, logo_url)
select 
  'Sholawat Nariyah', 
  'SURABAYA', 
  'Wadah silaturahmi dan majelis dzikir untuk mempererat ukhuwah islamiyah.', 
  'Jl. Masjid Al-Akbar No. 1, Surabaya', 
  'info@jsn-surabaya.com', 
  '0812-3456-7890', 
  'https://placehold.co/400x400/064e3b/ffffff?text=JSN'
where not exists (select 1 from public.site_config);

-- 3. Dummy Berita (Opsional)
insert into public.news (title, excerpt, content, image_url)
select 
  'Majelis Akbar Bulan Ini', 
  'Ribuan jamaah memadati lokasi majelis untuk bersholawat bersama.', 
  '<p>Kegiatan rutin berjalan lancar...</p>', 
  'https://picsum.photos/800/600'
where not exists (select 1 from public.news where title = 'Majelis Akbar Bulan Ini');

-- =================================================================
-- SECURITY POLICIES (Row Level Security)
-- Drop kebijakan lama sebelum membuat yang baru untuk menghindari error
-- =================================================================

alter table public.users enable row level security;
alter table public.registrations enable row level security;
alter table public.news enable row level security;
alter table public.gallery enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.site_config enable row level security;

-- Hapus policy jika ada (Reset Policies)
drop policy if exists "Public Access Users" on public.users;
drop policy if exists "Public Access Registrations" on public.registrations;
drop policy if exists "Public Access News" on public.news;
drop policy if exists "Public Access Gallery" on public.gallery;
drop policy if exists "Public Access Sessions" on public.attendance_sessions;
drop policy if exists "Public Access Records" on public.attendance_records;
drop policy if exists "Public Access Config" on public.site_config;

-- Buat ulang policy
create policy "Public Access Users" on public.users for all using (true) with check (true);
create policy "Public Access Registrations" on public.registrations for all using (true) with check (true);
create policy "Public Access News" on public.news for all using (true) with check (true);
create policy "Public Access Gallery" on public.gallery for all using (true) with check (true);
create policy "Public Access Sessions" on public.attendance_sessions for all using (true) with check (true);
create policy "Public Access Records" on public.attendance_records for all using (true) with check (true);
create policy "Public Access Config" on public.site_config for all using (true) with check (true);

-- =================================================================
-- STORAGE CONFIGURATION
-- =================================================================

-- 1. Create Bucket 'public-files'
insert into storage.buckets (id, name, public) values ('public-files', 'public-files', true)
on conflict (id) do nothing;

-- 2. Storage Policies
drop policy if exists "Public Access Files" on storage.objects;
drop policy if exists "Auth Upload Files" on storage.objects;
drop policy if exists "Auth Update Files" on storage.objects;
drop policy if exists "Auth Delete Files" on storage.objects;

create policy "Public Access Files" on storage.objects for select using ( bucket_id = 'public-files' );
create policy "Auth Upload Files" on storage.objects for insert with check ( bucket_id = 'public-files' );
create policy "Auth Update Files" on storage.objects for update with check ( bucket_id = 'public-files' );
create policy "Auth Delete Files" on storage.objects for delete using ( bucket_id = 'public-files' );
```