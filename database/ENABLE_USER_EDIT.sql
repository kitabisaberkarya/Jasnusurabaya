
-- =================================================================
-- ENABLE USER EDIT, DELETE & NIK COLUMN
-- Description: Memastikan kolom NIK ada dan Admin bisa mengedit serta menghapus data anggota.
-- =================================================================

-- 1. Pastikan kolom NIK ada
alter table public.users add column if not exists nik text;

-- 2. Pastikan Policy untuk UPDATE User aktif
drop policy if exists "Admin Update Users" on public.users;
drop policy if exists "All Update Users" on public.users;

-- Policy: Izinkan Admin Update (Edit Data & Reset Password)
create policy "Admin Update Users"
on public.users
for update
using (true)
with check (true);

-- 3. Pastikan Policy untuk DELETE User aktif (NEW)
drop policy if exists "Admin Delete Users" on public.users;

-- Policy: Izinkan Admin Delete (Hapus Anggota)
create policy "Admin Delete Users"
on public.users
for delete
using (true);
