
-- =================================================================
-- FIX ATTENDANCE ACCESS & DUMMY DATA
-- Jalankan script ini di SQL Editor Supabase
-- =================================================================

-- 1. Pastikan Policy SELECT untuk Attendance Sessions Terbuka untuk Authenticated User
-- (Kadang policy 'ALL' tidak mencakup SELECT dengan benar di beberapa client)
drop policy if exists "Public Access Sessions" on public.attendance_sessions;

create policy "Public Read Sessions"
on public.attendance_sessions for select
using (true);

create policy "Admin Manage Sessions"
on public.attendance_sessions for all
using (true)
with check (true);

-- 2. Buat Satu Sesi Absensi Aktif (Untuk Percobaan Hari Ini)
-- Ini memastikan anggota langsung melihat sesi saat membuka menu.
insert into public.attendance_sessions (name, date, is_open, attendees)
values 
(
  'Majelis Rutin Malam Jumat (Test)', 
  to_char(now(), 'YYYY-MM-DD'), 
  true, 
  '[]'::jsonb
)
on conflict do nothing;

-- 3. Pastikan Policy Upload Bukti Foto (Storage) benar
-- Mengizinkan user upload foto ke bucket 'public-files'
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'public-files' );
