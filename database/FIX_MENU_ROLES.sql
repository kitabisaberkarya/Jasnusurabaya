-- =================================================================
-- FIX MENU & ROLE INCONSISTENCY
-- Description: Menormalkan data role pengguna ke huruf kecil (lowercase)
-- untuk memastikan logika frontend bekerja dengan benar dan menu muncul.
-- =================================================================

-- 1. Normalkan semua role menjadi lowercase
UPDATE public.users 
SET role = LOWER(role) 
WHERE role IS NOT NULL;

-- 2. Pastikan hanya ada role yang valid
-- Jika ada role typo seperti 'Admin ' (dengan spasi) atau lainnya
UPDATE public.users 
SET role = 'admin' 
WHERE role LIKE '%admin%' AND role NOT IN ('korwil', 'pengurus');

UPDATE public.users 
SET role = 'korwil' 
WHERE role LIKE '%korwil%';

UPDATE public.users 
SET role = 'pengurus' 
WHERE role LIKE '%pengurus%';

-- 3. Pastikan user dengan email tertentu adalah admin (Opsional - Safety Net)
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'jasnu.nariyahsurabaya@gmail.com';

-- 4. Validasi Constraint (Opsional)
-- Memastikan data masa depan konsisten
-- ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'korwil', 'pengurus', 'member'));
