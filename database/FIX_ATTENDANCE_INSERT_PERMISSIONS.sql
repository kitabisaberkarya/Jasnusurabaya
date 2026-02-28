-- =================================================================
-- FIX ATTENDANCE INSERT PERMISSIONS (REVISI)
-- Description: Memperbaiki masalah data absensi tidak masuk karena 
-- policy RLS yang membatasi insert hanya untuk 'authenticated' user.
-- Karena aplikasi menggunakan custom login (bukan Supabase Auth), 
-- maka user dianggap 'anon/public' oleh Supabase.
-- =================================================================

-- 1. Reset Policy Insert pada attendance_records
DROP POLICY IF EXISTS "Member Insert Records" ON public.attendance_records;

-- 2. Buat Policy Baru: Izinkan Public (Anon) untuk Insert
-- Kita izinkan public karena autentikasi ditangani di level aplikasi.
CREATE POLICY "Public Insert Records"
ON public.attendance_records FOR INSERT
WITH CHECK (true);

-- 3. Pastikan Policy Select juga terbuka untuk Public
DROP POLICY IF EXISTS "Public Read Records" ON public.attendance_records;
CREATE POLICY "Public Read Records"
ON public.attendance_records FOR SELECT
USING (true);

-- 4. Berikan izin yang sama untuk tabel attendance_sessions (jika belum)
DROP POLICY IF EXISTS "All Update Sessions" ON public.attendance_sessions;
CREATE POLICY "Public Update Sessions"
ON public.attendance_sessions FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. Berikan izin akses storage (jika belum)
-- Agar user bisa upload foto bukti absensi tanpa Supabase Auth
DROP POLICY IF EXISTS "Public Upload Storage" ON storage.objects;
CREATE POLICY "Public Upload Storage"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'public-files' );

DROP POLICY IF EXISTS "Public Select Storage" ON storage.objects;
CREATE POLICY "Public Select Storage"
ON storage.objects FOR SELECT
USING ( bucket_id = 'public-files' );
