-- =================================================================
-- SOLUSI UTAMA: FIX AKSES LOGIN (RLS)
-- Jalankan script ini di SQL Editor Supabase Project BARU Anda
-- =================================================================

-- 1. Buka Akses Baca (SELECT) ke Tabel Users untuk Publik/Anon
-- Tanpa ini, aplikasi tidak bisa mengecek apakah email/password benar.
DROP POLICY IF EXISTS "Public Read Users" ON public.users;
CREATE POLICY "Public Read Users" 
ON public.users 
FOR SELECT 
USING (true);

-- 2. Perbaiki Format Role (Case Sensitivity)
-- Mengubah 'Admin' menjadi 'admin' agar sesuai logika kode.
UPDATE public.users SET role = 'admin' WHERE role ILIKE 'admin';
UPDATE public.users SET role = 'korwil' WHERE role ILIKE 'korwil';
UPDATE public.users SET role = 'pengurus' WHERE role ILIKE 'pengurus';
UPDATE public.users SET role = 'member' WHERE role ILIKE 'member';

-- 3. Buka Akses Konfigurasi Website (Agar logo/nama app muncul)
DROP POLICY IF EXISTS "Public Read Config" ON public.site_config;
CREATE POLICY "Public Read Config" 
ON public.site_config 
FOR SELECT 
USING (true);

-- 4. Pastikan Data Admin Ada (Safety Check)
-- Jika tabel kosong, masukkan admin default.
INSERT INTO public.users (name, email, role, status, nia, password, wilayah, joined_at)
SELECT 'Administrator JSN', 'jasnu.nariyahsurabaya@gmail.com', 'admin', 'active', 'ADMIN-MASTER', 'JasnuNariyahSurabaya1926', 'Pusat', '2025-01-01'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'admin');

-- 5. Perbaiki Akses Storage (Agar foto profil/berita bisa dilihat)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public-files', 'public-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Select Access" ON storage.objects;
CREATE POLICY "Public Select Access" ON storage.objects FOR SELECT USING ( bucket_id = 'public-files' );

-- =================================================================
-- CARA MENJALANKAN:
-- 1. Buka Dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih Project 'jsn-database'
-- 3. Klik menu 'SQL Editor' (ikon terminal di kiri)
-- 4. Klik '+ New Query'
-- 5. Copy-Paste semua kode di atas
-- 6. Klik tombol 'Run' (kanan bawah)
-- =================================================================