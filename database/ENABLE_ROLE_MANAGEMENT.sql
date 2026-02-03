-- =================================================================
-- ENABLE ROLE MANAGEMENT
-- Description: Memastikan admin bisa mengubah role user menjadi 'pengurus'
-- =================================================================

-- 1. Pastikan Policy UPDATE User mengizinkan perubahan kolom ROLE
-- (Policy 'Admin Update Users' yang dibuat sebelumnya sudah mencakup 'using (true)', 
-- artinya admin bisa update semua kolom, termasuk role).

-- 2. Validasi Data Role (Opsional, untuk merapikan data lama)
-- Pastikan tidak ada role aneh di database
UPDATE public.users 
SET role = 'member' 
WHERE role NOT IN ('admin', 'super_admin', 'korwil', 'pengurus', 'member');

-- 3. Contoh Manual: Mengangkat User menjadi Pengurus (Jika ingin via SQL)
-- Ganti 'email@user.com' dengan email anggota yang ingin diangkat
-- UPDATE public.users SET role = 'pengurus' WHERE email = 'email@user.com';
