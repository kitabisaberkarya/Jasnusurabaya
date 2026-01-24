
-- =================================================================
-- FIX ATTENDANCE ACTIONS (EDIT & DELETE)
-- Description: Script ini secara spesifik memberikan izin UPDATE dan DELETE
-- pada tabel attendance_records untuk keperluan manajemen admin.
-- =================================================================

-- 1. Pastikan RLS Aktif
alter table public.attendance_records enable row level security;

-- 2. Reset Policy Khusus untuk Manajemen Data
-- Kita hapus policy lama yang mungkin terlalu restriktiv atau konflik
-- NOTE: Urutan DROP penting agar tidak error jika dijalankan ulang
drop policy if exists "Admin Manage Records" on public.attendance_records;
drop policy if exists "Admin Update Records" on public.attendance_records;
drop policy if exists "Admin Delete Records" on public.attendance_records;
drop policy if exists "Public Read Records" on public.attendance_records;

-- 3. Buat Policy Baru

-- Policy untuk UPDATE (Edit Data)
create policy "Admin Update Records"
on public.attendance_records
for update
using (true)
with check (true);

-- Policy untuk DELETE (Hapus Data)
create policy "Admin Delete Records"
on public.attendance_records
for delete
using (true);

-- Policy untuk SELECT (Melihat Data)
create policy "Public Read Records"
on public.attendance_records for select
using (true);
