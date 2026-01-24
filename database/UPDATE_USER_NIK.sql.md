
```sql
-- =================================================================
-- UPDATE SCHEMA - USERS (NIK KTP)
-- Description: Menambahkan kolom 'nik' pada tabel users agar NIK dari pendaftaran tersimpan.
-- =================================================================

-- 1. Tambah Kolom NIK
alter table public.users add column if not exists nik text;

-- 2. Optional: Jika ingin memastikan NIK unik (namun hati-hati dengan data lama yang mungkin null)
-- alter table public.users add constraint users_nik_key unique (nik);

-- =================================================================
-- CATATAN PENTING:
-- Data pengguna lama yang sudah terdaftar sebelum script ini dijalankan
-- akan memiliki nilai NIK = NULL. 
-- Admin perlu mengupdate manual jika diperlukan.
-- =================================================================
```