
-- =================================================================
-- ENABLE SUPABASE REALTIME
-- Description: Mengaktifkan replikasi pada tabel agar klien bisa subscribe
-- event (INSERT/UPDATE/DELETE) secara langsung via WebSocket.
-- =================================================================

-- 1. Pastikan Publikasi 'supabase_realtime' ada
-- (Biasanya sudah ada secara default, tapi kita pastikan ulang)
drop publication if exists supabase_realtime;
create publication supabase_realtime;

-- 2. Tambahkan Tabel ke Publikasi Realtime
-- Kita hanya menambahkan tabel yang membutuhkan update instan di UI
alter publication supabase_realtime add table public.site_config;
alter publication supabase_realtime add table public.news;
alter publication supabase_realtime add table public.attendance_sessions;
alter publication supabase_realtime add table public.attendance_records;

-- 3. Konfigurasi Replica Identity (Penting untuk UPDATE/DELETE event)
-- Agar Supabase bisa mengirimkan data 'old' dan 'new' dengan benar
alter table public.site_config replica identity full;
alter table public.news replica identity full;
alter table public.attendance_sessions replica identity full;
alter table public.attendance_records replica identity full;

-- Selesai.
-- Sekarang AppContext.tsx bisa menggunakan .on('postgres_changes')
