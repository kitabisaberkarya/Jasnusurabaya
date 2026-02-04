
-- =================================================================
-- FIX DATA VISIBILITY (READ ACCESS)
-- Description: Script ini memastikan bahwa Admin, Pengurus, dan Korwil
-- memiliki hak akses untuk MELIHAT (SELECT) data pada tabel utama.
-- Masalah "Menu Kosong" biasanya karena policy SELECT hilang.
-- =================================================================

-- 1. USERS (Data Anggota)
drop policy if exists "Public Read Users" on public.users;
create policy "Public Read Users" 
on public.users for select 
using (true);

-- 2. ATTENDANCE SESSIONS (Sesi Absensi)
drop policy if exists "Public Read Sessions" on public.attendance_sessions;
create policy "Public Read Sessions" 
on public.attendance_sessions for select 
using (true);

-- 3. ATTENDANCE RECORDS (Data Kehadiran & Rekap)
drop policy if exists "Public Read Records" on public.attendance_records;
create policy "Public Read Records" 
on public.attendance_records for select 
using (true);

-- 4. REGISTRATIONS (Data Approval)
drop policy if exists "Public Read Registrations" on public.registrations;
create policy "Public Read Registrations" 
on public.registrations for select 
using (true);

-- 5. CONTENT (News, Gallery, Slider)
drop policy if exists "Public Read News" on public.news;
create policy "Public Read News" on public.news for select using (true);

drop policy if exists "Public Read Gallery" on public.gallery;
create policy "Public Read Gallery" on public.gallery for select using (true);

drop policy if exists "Public Read Sliders" on public.sliders;
create policy "Public Read Sliders" on public.sliders for select using (true);

-- Konfirmasi Permission Grant
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
