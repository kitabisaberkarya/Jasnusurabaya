
```sql
-- =================================================================
-- UPDATE SCHEMA JSN 2025: MULTI-LEVEL ADMIN & GEOFENCING
-- Description: Menambahkan dukungan role Korwil & Pengurus, 
-- update status registrasi, dan kolom geolokasi sesi absensi.
-- =================================================================

-- 1. UPDATE ATTENDANCE SESSIONS (GEOFENCING)
-- Menambahkan kolom koordinat dan radius
alter table public.attendance_sessions 
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists radius integer default 100;

-- 2. UPDATE USER STATUS (APPROVAL WORKFLOW)
-- Status 'verified_korwil' ditangani di level aplikasi (string), 
-- namun pastikan kolom status cukup panjang atau tipe text.
-- (Sudah text di schema awal, jadi aman).

-- 3. SEEDING AKUN ADMIN BERTINGKAT
-- Password Default: 12345678 (Harap diubah setelah login)

-- A. ADMIN KORWIL (Contoh: Rungkut)
insert into public.users (name, email, role, status, nia, password, wilayah, joined_at)
values 
('Admin Korwil Rungkut', 'korwil.rungkut@jsn.com', 'korwil', 'active', 'ADM-KORWIL-01', '12345678', 'Rungkut Kidul', '2025-01-01')
on conflict (nia) do nothing;

-- B. ADMIN PENGURUS PUSAT
insert into public.users (name, email, role, status, nia, password, wilayah, joined_at)
values 
('Sekretaris Pusat JSN', 'sekretariat@jsn.com', 'pengurus', 'active', 'ADM-PUSAT-01', '12345678', 'Surabaya Pusat', '2025-01-01')
on conflict (nia) do nothing;

-- 4. UPDATE PERMISSIONS
-- Pastikan Admin level baru bisa akses tabel users dan registrations

-- Update Policy Users agar bisa di-manage oleh korwil/pengurus (jika menggunakan RLS ketat)
-- Untuk simplifikasi di aplikasi ini, policy "Admin Update Users" yang sudah ada 
-- biasanya memeriksa role di sisi aplikasi atau menggunakan service key.
-- Namun jika menggunakan Auth Supabase murni, tambahkan policy berikut:

-- (Opsional jika menggunakan Supabase Auth Roles)
-- create policy "Korwil View Pending" on public.registrations for select using (auth.jwt() ->> 'role' = 'korwil');

-- =================================================================
-- PANDUAN PENGGUNAAN FITUR BARU
-- =================================================================
-- 1. Login sebagai Korwil (Email: korwil.rungkut@jsn.com, Pass: 12345678)
--    -> Menu yang muncul HANYA "Approval Anggota".
--    -> Bisa klik "Verifikasi (Korwil)" pada status Pending.
--
-- 2. Login sebagai Pengurus (Email: sekretariat@jsn.com, Pass: 12345678)
--    -> Menu: Approval Anggota, Absensi, Rekap.
--    -> Bisa klik "Terbit NIA" pada status Verified Korwil.
--
-- 3. Login sebagai Super Admin (Email lama)
--    -> Akses penuh semua menu.
```
