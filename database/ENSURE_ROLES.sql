
-- =================================================================
-- ENSURE ROLES FOR NEW LOGIN SYSTEM
-- Description: Memastikan role 'korwil' dan 'pengurus' valid di DB
-- =================================================================

-- 1. Update Role yang mungkin typo atau format lama
-- Pastikan hanya ada: 'admin' (super), 'korwil', 'pengurus', 'member'

-- Ubah 'admin_korwil' atau variasi lain menjadi 'korwil'
update public.users set role = 'korwil' where role ilike '%korwil%';

-- Ubah 'admin_pengurus' atau variasi lain menjadi 'pengurus' 
-- (Kecuali jika Anda ingin membedakan, tapi di frontend kita grupkan)
update public.users set role = 'pengurus' where role ilike '%pengurus%';

-- Pastikan Super Admin role-nya 'admin' (default Supabase/Logic lama)
-- Atau jika kita ingin transisi ke 'super_admin' di DB masa depan, 
-- untuk sekarang kita stick ke 'admin' agar tidak merusak AppContext.
update public.users set role = 'admin' where email = 'jasnu.nariyahsurabaya@gmail.com';

-- 2. Pastikan Constraint Check (Opsional untuk data integrity masa depan)
-- alter table public.users add constraint check_roles check (role in ('admin', 'korwil', 'pengurus', 'member'));
