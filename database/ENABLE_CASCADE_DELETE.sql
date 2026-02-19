
-- =================================================================
-- ENABLE CASCADE DELETE FOR USERS
-- Description: Mengubah constraint Foreign Key pada tabel attendance_records
-- agar mendukung penghapusan user secara otomatis (Cascade).
-- Tanpa ini, Bulk Delete akan gagal jika user memiliki riwayat absensi.
-- =================================================================

-- 1. Hapus Constraint Lama (Foreign Key ke Users)
ALTER TABLE public.attendance_records
DROP CONSTRAINT IF EXISTS attendance_records_user_id_fkey;

-- 2. Buat Ulang Constraint dengan ON DELETE CASCADE
ALTER TABLE public.attendance_records
ADD CONSTRAINT attendance_records_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- 3. Lakukan hal yang sama untuk tabel lain yang berelasi (jika ada)
-- Contoh: Maintenance Logs (jika sudah dibuat)
ALTER TABLE public.maintenance_logs
DROP CONSTRAINT IF EXISTS maintenance_logs_admin_id_fkey;

ALTER TABLE public.maintenance_logs
ADD CONSTRAINT maintenance_logs_admin_id_fkey
FOREIGN KEY (admin_id)
REFERENCES public.users(id)
ON DELETE CASCADE;
