
```sql
-- =================================================================
-- UPDATE SCHEMA - DIGITAL ASSETS FOR E-KTA
-- Description: Menambahkan kolom untuk menyimpan URL Tanda Tangan
-- dan Stempel Digital pengurus pada tabel konfigurasi.
-- =================================================================

-- 1. Tambah kolom signature_url dan stamp_url
ALTER TABLE public.site_config 
ADD COLUMN IF NOT EXISTS signature_url text,
ADD COLUMN IF NOT EXISTS stamp_url text;

-- 2. Pastikan Policy Storage Mengizinkan (Sudah diatur sebelumnya)
-- Bucket 'public-files' digunakan untuk menyimpan aset ini.
-- Pastikan Admin memiliki akses update ke tabel site_config (sudah default).

-- =================================================================
-- CATATAN PENGGUNAAN:
-- Disarankan menggunakan file format PNG dengan background transparan
-- agar hasil pada E-KTA terlihat profesional dan menyatu.ok
-- =================================================================
```
