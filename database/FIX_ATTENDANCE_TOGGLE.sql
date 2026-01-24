
-- =================================================================
-- FIX ATTENDANCE SESSION TOGGLE (OPEN/CLOSE)
-- Description: Memastikan kolom is_open ada dan policy mengizinkan update.
-- =================================================================

-- 1. Pastikan kolom is_open ada di tabel attendance_sessions
-- Jika sudah ada, perintah ini akan diabaikan (safe).
alter table public.attendance_sessions 
add column if not exists is_open boolean default true;

-- 2. Perbaiki Permission/Policy agar Admin bisa UPDATE status sesi
-- Drop policy lama yang mungkin membatasi akses update
drop policy if exists "Admin Manage Sessions" on public.attendance_sessions;

-- Buat policy baru yang mengizinkan SEMUA operasi (termasuk Update)
create policy "Admin Manage Sessions" 
on public.attendance_sessions 
for all 
using (true) 
with check (true);

-- 3. (Opsional) Update data lama yang mungkin NULL menjadi TRUE
update public.attendance_sessions 
set is_open = true 
where is_open is null;
