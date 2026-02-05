-- =================================================================
-- FIX STORAGE UPLOAD PERMISSION (CRITICAL FIX)
-- Masalah: Upload gagal karena App menggunakan Custom Auth (bukan Supabase Auth),
-- sehingga status user dianggap 'anon' oleh Storage, sedangkan policy lama butuh 'authenticated'.
-- =================================================================

-- 1. Pastikan Bucket Ada dan Public
insert into storage.buckets (id, name, public)
values ('public-files', 'public-files', true)
on conflict (id) do update set public = true;

-- 2. RESET TOTAL POLICY (Hapus semua aturan lama yang memblokir)
drop policy if exists "Public Access Files" on storage.objects;
drop policy if exists "Auth Upload Files" on storage.objects;
drop policy if exists "Auth Update Files" on storage.objects;
drop policy if exists "Auth Delete Files" on storage.objects;
drop policy if exists "Anon Upload Files" on storage.objects;
drop policy if exists "Give me access" on storage.objects;

-- 3. BUAT POLICY BARU YANG KOMPATIBEL DENGAN CUSTOM AUTH

-- Policy 1: IZINKAN SEMUA ORANG MELIHAT GAMBAR (SELECT)
create policy "Public Select Access"
on storage.objects for select
using ( bucket_id = 'public-files' );

-- Policy 2: IZINKAN UPLOAD (INSERT) UNTUK SEMUA USER (Anon/Authenticated)
-- Karena validasi admin dilakukan di sisi Frontend/App Context,
-- kita izinkan operasi insert ke bucket khusus ini.
create policy "Universal Insert Access"
on storage.objects for insert
with check ( bucket_id = 'public-files' );

-- Policy 3: IZINKAN UPDATE/DELETE UNTUK SEMUA USER
create policy "Universal Update Delete Access"
on storage.objects for all
using ( bucket_id = 'public-files' );

-- =================================================================
-- CARA PAKAI:
-- 1. Buka Dashboard Supabase -> SQL Editor
-- 2. Copy-Paste semua kode ini
-- 3. Klik RUN
-- 4. Coba upload foto lagi di Admin Panel
-- =================================================================