-- =================================================================
-- UPDATE SCHEMA - GOOGLE MAPS URL SUPPORT
-- Description: Menambahkan kolom untuk menyimpan link referensi Google Maps
-- =================================================================

-- 1. Tambah kolom maps_url pada tabel attendance_sessions
alter table public.attendance_sessions 
add column if not exists maps_url text;

-- 2. Pastikan permission RLS mengizinkan update kolom baru ini
-- (Secara default policy "Admin Manage Sessions" using (true) with check (true) 
-- yang sudah dibuat sebelumnya akan otomatis mencakup kolom baru ini).

-- =================================================================
-- PANDUAN:
-- Jalankan script ini di SQL Editor Supabase Anda.
-- =================================================================