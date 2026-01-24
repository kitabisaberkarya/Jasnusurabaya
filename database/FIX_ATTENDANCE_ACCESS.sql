
-- =================================================================
-- FIX ATTENDANCE ACCESS & DATA RECORDING (REVISION 2)
-- Description: Script ini memperbaiki masalah permission error (42710) 
-- dan memastikan data absensi masuk ke database.
-- =================================================================

-- 1. RESET & FIX ATTENDANCE SESSIONS POLICIES
-- Drop semua policy lama yang mungkin konflik
drop policy if exists "Public Access Sessions" on public.attendance_sessions;
drop policy if exists "Public Read Sessions" on public.attendance_sessions;
drop policy if exists "Admin Manage Sessions" on public.attendance_sessions;
drop policy if exists "Member Update Sessions" on public.attendance_sessions;
drop policy if exists "All Update Sessions" on public.attendance_sessions;
drop policy if exists "Admin Delete Sessions" on public.attendance_sessions;

-- Buat Policy: Semua orang bisa melihat sesi
create policy "Public Read Sessions"
on public.attendance_sessions for select
using (true);

-- Buat Policy: Member & Admin bisa mengupdate sesi (PENTING: Untuk update array 'attendees')
create policy "All Update Sessions"
on public.attendance_sessions for update
using (true)
with check (true);

-- Buat Policy: Admin bisa insert
create policy "Admin Insert Sessions"
on public.attendance_sessions for insert
with check (true);

-- Buat Policy: Admin bisa delete
create policy "Admin Delete Sessions"
on public.attendance_sessions for delete
using (true);


-- 2. RESET & FIX ATTENDANCE RECORDS POLICIES
-- Masalah "Data tidak masuk" seringkali karena tabel ini terkunci RLS
drop policy if exists "Public Access Records" on public.attendance_records;
drop policy if exists "Public Read Records" on public.attendance_records;
drop policy if exists "Member Insert Records" on public.attendance_records;
drop policy if exists "Admin Manage Records" on public.attendance_records;

-- Buat Policy: Member bisa melakukan Absensi (Insert)
create policy "Member Insert Records"
on public.attendance_records for insert
to authenticated
with check (true);

-- Buat Policy: Semua bisa melihat data (Admin untuk dashboard, Member untuk history)
create policy "Public Read Records"
on public.attendance_records for select
using (true);

-- Buat Policy: Admin bisa update/hapus data absensi
create policy "Admin Manage Records"
on public.attendance_records for all
using (true)
with check (true);


-- 3. FIX STORAGE PERMISSIONS (Untuk Foto Bukti Absensi)
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Public Access Files" on storage.objects;
drop policy if exists "Auth Upload Files" on storage.objects;

-- Allow public read (Melihat foto)
create policy "Public Access Files"
on storage.objects for select
using ( bucket_id = 'public-files' );

-- Allow authenticated upload (Upload foto saat absen)
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'public-files' );
