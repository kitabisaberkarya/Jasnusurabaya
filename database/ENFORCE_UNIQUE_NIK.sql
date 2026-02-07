
-- =================================================================
-- ENFORCE UNIQUE NIK CONSTRAINT (WITH AUTO-CLEANUP)
-- Description: Script ini akan MEMBERSIHKAN data ganda terlebih dahulu
-- sebelum menerapkan aturan UNIK pada kolom NIK.
-- =================================================================

-- -----------------------------------------------------------------
-- LANGKAH 1: BERSIHKAN DATA (Hapus Duplikat)
-- -----------------------------------------------------------------

-- 1.A. Normalisasi: Ubah NIK kosong ('') menjadi NULL agar tidak dianggap duplikat
-- Karena UNIQUE index membolehkan banyak NULL, tapi hanya satu string kosong ''.
UPDATE public.users SET nik = NULL WHERE nik = '';
UPDATE public.registrations SET nik = NULL WHERE nik = '';

-- 1.B. Hapus Duplikat di Tabel USERS (Simpan data terbaru berdasarkan ID terbesar)
-- Data dengan ID lebih kecil (data lama) yang memiliki NIK sama akan dihapus.
DELETE FROM public.users
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (partition BY nik ORDER BY id DESC) AS rnum
        FROM public.users
        WHERE nik IS NOT NULL
    ) t
    WHERE t.rnum > 1
);

-- 1.C. Hapus Duplikat di Tabel REGISTRATIONS
DELETE FROM public.registrations
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (partition BY nik ORDER BY id DESC) AS rnum
        FROM public.registrations
        WHERE nik IS NOT NULL
    ) t
    WHERE t.rnum > 1
);

-- -----------------------------------------------------------------
-- LANGKAH 2: TERAPKAN CONSTRAINT
-- -----------------------------------------------------------------

-- 2.A. Tambahkan Constraint UNIQUE pada tabel Users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_nik_key'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_nik_key UNIQUE (nik);
    END IF;
END $$;

-- 2.B. Tambahkan Constraint UNIQUE pada tabel Registrations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'registrations_nik_key'
    ) THEN
        ALTER TABLE public.registrations ADD CONSTRAINT registrations_nik_key UNIQUE (nik);
    END IF;
END $$;

-- 3. Tambahkan Index untuk Performa Pencarian NIK
CREATE INDEX IF NOT EXISTS idx_users_nik ON public.users (nik);
CREATE INDEX IF NOT EXISTS idx_registrations_nik ON public.registrations (nik);

-- =================================================================
-- HASIL AKHIR:
-- 1. Data NIK ganda yang lama telah dihapus.
-- 2. Kolom NIK sekarang dilindungi aturan UNIQUE (tidak bisa input kembar lagi).
-- =================================================================
