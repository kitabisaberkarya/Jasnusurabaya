-- =================================================================
-- RELAX CONSTRAINTS FOR BULK IMPORT (FORCE IMPORT MODE)
-- Description: Script ini menghapus aturan UNIK pada NIK dan NIA 
-- agar semua data dari CSV bisa masuk tanpa tertolak.
-- =================================================================

-- 1. Hapus Constraint Unique pada NIK (Tabel Users)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_nik_key;

-- 2. Hapus Constraint Unique pada NIA (Tabel Users)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_nia_key;

-- 3. Hapus Constraint Unique pada NIK (Tabel Registrations)
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_nik_key;

-- 4. Reset Sequence ID (Penting agar input manual setelah ini tidak error)
SELECT setval(pg_get_serial_sequence('public.users', 'id'), coalesce(max(id),0) + 1, false) FROM public.users;
SELECT setval(pg_get_serial_sequence('public.registrations', 'id'), coalesce(max(id),0) + 1, false) FROM public.registrations;

-- =================================================================
-- CATATAN:
-- Jalankan script ini di SQL Editor Supabase SEBELUM melakukan import 
-- jika Anda ingin mengabaikan error duplikasi NIK/NIA.
-- =================================================================
