
-- =================================================================
-- UPDATE SCHEMA - USER PROFILE PHOTO
-- Description: Menambahkan kolom untuk menyimpan URL foto profil member
-- agar bisa tampil di KTA.
-- =================================================================

-- 1. Tambah kolom profile_photo_url
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_photo_url text;

-- 2. Pastikan Policy Storage mengizinkan (Sudah diatur di script sebelumnya)
-- Namun untuk memastikan, pastikan bucket 'public-files' public.
-- (Tidak perlu action tambahan jika setup storage sebelumnya sudah dijalankan)
