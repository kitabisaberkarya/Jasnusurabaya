-- =================================================================
-- SETUP GEOFENCING (ABSENSI RADIUS)
-- Description: Menambahkan kolom koordinat dan radius untuk sesi absensi.
-- =================================================================

-- 1. Tambah kolom Latitude, Longitude, dan Radius pada tabel sesi
--    Radius default diset 100 meter jika tidak diisi.
ALTER TABLE public.attendance_sessions 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS radius INTEGER DEFAULT 100;

-- 2. Pastikan Admin memiliki akses penuh (CRUD) ke tabel ini
--    (Biasanya sudah tercover oleh policy 'Admin Manage Sessions', 
--     namun ini untuk memastikan kolom baru bisa diakses).

-- Selesai.
-- Setelah script ini dijalankan, fitur "Gunakan Lokasi Saya" di Admin Panel akan berfungsi normal.
