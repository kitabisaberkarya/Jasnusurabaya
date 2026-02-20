-- Script untuk mencari data pendaftaran berdasarkan NIK atau Nama
-- Gunakan script ini di SQL Editor Supabase untuk menemukan data yang "hilang" atau tertahan

-- 1. Cari di tabel Registrations (Pendaftaran yang belum disetujui atau ditolak)
SELECT id, name, nik, status, date, wilayah
FROM public.registrations
WHERE nik = '3578032810630003' OR name ILIKE '%Ircham%';

-- 2. Cari di tabel Users (Anggota yang sudah aktif)
SELECT id, name, nik, nia, status, role, wilayah
FROM public.users
WHERE nik = '3578032810630003' OR name ILIKE '%Ircham%';

-- 3. (Opsional) Hapus data pendaftaran lama jika ingin pendaftar mengulang dari nol
-- DELETE FROM public.registrations WHERE nik = '3578032810630003';
