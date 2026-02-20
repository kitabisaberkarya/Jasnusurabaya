-- =================================================================
-- RESTORE UNIQUE CONSTRAINTS (OPSIONAL - UNTUK INTEGRITAS DATA)
-- Description: Script ini mengembalikan aturan UNIK pada NIK dan NIA.
-- Jalankan ini HANYA JIKA Anda sudah selesai melakukan import massal
-- dan ingin memastikan tidak ada data ganda di masa depan.
-- =================================================================

-- 1. Bersihkan data ganda di tabel Users (Simpan yang ID-nya paling besar/terbaru)
DELETE FROM public.users a USING public.users b 
WHERE a.id < b.id AND a.nik = b.nik;

-- 2. Tambahkan kembali Constraint Unique pada NIK (Tabel Users)
ALTER TABLE public.users ADD CONSTRAINT users_nik_key UNIQUE (nik);

-- 3. Tambahkan kembali Constraint Unique pada NIA (Tabel Users)
ALTER TABLE public.users ADD CONSTRAINT users_nia_key UNIQUE (nia);

-- 4. Tambahkan kembali Constraint Unique pada NIK (Tabel Registrations)
ALTER TABLE public.registrations ADD CONSTRAINT registrations_nik_key UNIQUE (nik);

-- =================================================================
-- CATATAN:
-- Jika script ini error saat dijalankan, berarti masih ada data ganda
-- yang belum terhapus. Pastikan NIK benar-benar unik sebelum menjalankan ini.
-- =================================================================
