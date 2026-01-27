
-- =================================================================
-- UPDATE PERMISSIONS: ATTENDANCE SESSIONS
-- Description: Script ini memastikan tabel attendance_sessions bisa 
-- di-update (Edit Nama) dan di-delete oleh Admin.
-- =================================================================

-- 1. Reset Policy pada tabel attendance_sessions
alter table public.attendance_sessions enable row level security;

drop policy if exists "Admin Manage Sessions" on public.attendance_sessions;
drop policy if exists "Admin Delete Sessions" on public.attendance_sessions;
drop policy if exists "All Update Sessions" on public.attendance_sessions;

-- 2. Buat Policy Tunggal yang Kuat untuk Admin (CRUD)
-- Mengizinkan SELECT, INSERT, UPDATE, DELETE untuk semua authenticated user (Admin/Member)
-- Note: Logika pembatasan role (hanya admin yang boleh delete) ditangani di sisi Aplikasi (AppContext)
create policy "Admin Manage Sessions"
on public.attendance_sessions
for all
using (true)
with check (true);

-- 3. Pastikan Policy untuk Records juga mengizinkan Delete (Cascade manual dari App)
drop policy if exists "Admin Manage Records" on public.attendance_records;

create policy "Admin Manage Records"
on public.attendance_records
for all
using (true)
with check (true);
