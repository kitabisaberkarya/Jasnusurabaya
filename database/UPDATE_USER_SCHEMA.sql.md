
```sql
-- =================================================================
-- UPDATE SCHEMA - USERS (ALAMAT & MANAGEMEN)
-- Description: Menambahkan kolom address pada tabel users
-- =================================================================

-- 1. Tambah Kolom Address
alter table public.users add column if not exists address text;

-- 2. Pastikan Policy mengizinkan Delete dan Update (Reset Password)
-- Reset Policy Users agar lebih fleksibel untuk Admin
drop policy if exists "Admin Update Users" on public.users;
drop policy if exists "Admin Delete Users" on public.users;

-- Admin dapat update semua user (untuk reset password)
create policy "Admin Update Users" on public.users for update using (true) with check (true);

-- Admin dapat hapus user
create policy "Admin Delete Users" on public.users for delete using (true);
```
