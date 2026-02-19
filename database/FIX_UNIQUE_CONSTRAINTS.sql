
-- =================================================================
-- FIX UNIQUE CONSTRAINT ISSUES (CLEAN DATA)
-- Description: Mengubah string kosong ('') menjadi NULL pada kolom unik
-- agar tidak dianggap sebagai data duplikat oleh database.
-- =================================================================

-- 1. Bersihkan Tabel USERS
UPDATE public.users SET nik = NULL WHERE nik = '';
UPDATE public.users SET nia = NULL WHERE nia = '';
UPDATE public.users SET email = NULL WHERE email = '';
UPDATE public.users SET phone = NULL WHERE phone = '';

-- 2. Bersihkan Tabel REGISTRATIONS
UPDATE public.registrations SET nik = NULL WHERE nik = '';
UPDATE public.registrations SET email = NULL WHERE email = '';

-- 3. (Opsional) Re-apply Constraints jika diperlukan (biasanya tidak perlu jika tabel sudah dibuat)
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_nik_key;
-- ALTER TABLE public.users ADD CONSTRAINT users_nik_key UNIQUE (nik);

-- 4. Reset Sequence (PENTING dijalankan setelah import selesai)
SELECT setval(pg_get_serial_sequence('public.users', 'id'), coalesce(max(id),0) + 1, false) FROM public.users;
