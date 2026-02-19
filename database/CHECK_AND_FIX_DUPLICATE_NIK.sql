-- Script untuk memeriksa dan memperbaiki masalah duplikasi NIK pada tabel users
-- Jalankan script ini di SQL Editor Supabase jika mengalami error "duplicate key value violates unique constraint"

-- 1. Cek apakah ada NIK ganda yang sudah ada di database
SELECT nik, COUNT(*) as jumlah
FROM users
WHERE nik IS NOT NULL
GROUP BY nik
HAVING COUNT(*) > 1;

-- 2. Cek apakah ada NIK kosong atau format salah
SELECT id, name, nik 
FROM users 
WHERE nik IS NULL OR nik = '';

-- 3. (Opsional) Hapus data user dengan NIK ganda (Hati-hati! Ini akan menghapus data)
-- DELETE FROM users
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY nik ORDER BY created_at DESC) as r
--     FROM users
--     WHERE nik IS NOT NULL
--   ) t
--   WHERE t.r > 1
-- );

-- 4. Pastikan constraint unique pada NIK benar
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_nik_key;
-- ALTER TABLE users ADD CONSTRAINT users_nik_key UNIQUE (nik);
