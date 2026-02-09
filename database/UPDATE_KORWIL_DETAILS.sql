-- =================================================================
-- UPDATE SCHEMA - DETAIL KORWIL (KOORDINATOR & KONTAK)
-- Description: Menambahkan kolom untuk menyimpan nama koordinator dan kontak
-- =================================================================

-- 1. Tambah Kolom Baru
ALTER TABLE public.korwils 
ADD COLUMN IF NOT EXISTS coordinator_name text,
ADD COLUMN IF NOT EXISTS contact text;

-- 2. Pastikan Policy RLS Mengizinkan Update (Admin Manage Korwils)
-- Policy "Admin Manage Korwils" yang sudah ada (using true) 
-- seharusnya sudah mencakup update kolom baru ini.

-- 3. (Opsional) Refresh Cache Schema di Supabase Dashboard 
-- jika kolom tidak langsung muncul di API.
