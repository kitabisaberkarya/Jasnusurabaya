
-- =================================================================
-- FIX SEQUENCES AFTER IMPORT (WAJIB JALANKAN SETELAH IMPORT CSV)
-- Description: Script ini mereset penghitung nomor otomatis (auto-increment)
-- agar sesuai dengan ID terakhir yang baru saja Anda import.
-- Tanpa script ini, input data baru akan GAGAL (Duplicate Key Error).
-- =================================================================

-- 1. Reset Sequence Users
SELECT setval(pg_get_serial_sequence('public.users', 'id'), coalesce(max(id),0) + 1, false) FROM public.users;

-- 2. Reset Sequence Registrations
SELECT setval(pg_get_serial_sequence('public.registrations', 'id'), coalesce(max(id),0) + 1, false) FROM public.registrations;

-- 3. Reset Sequence Attendance Sessions
SELECT setval(pg_get_serial_sequence('public.attendance_sessions', 'id'), coalesce(max(id),0) + 1, false) FROM public.attendance_sessions;

-- 4. Reset Sequence News
SELECT setval(pg_get_serial_sequence('public.news', 'id'), coalesce(max(id),0) + 1, false) FROM public.news;

-- 5. Reset Sequence Gallery
SELECT setval(pg_get_serial_sequence('public.gallery', 'id'), coalesce(max(id),0) + 1, false) FROM public.gallery;

-- 6. Reset Sequence Sliders
SELECT setval(pg_get_serial_sequence('public.sliders', 'id'), coalesce(max(id),0) + 1, false) FROM public.sliders;

-- 7. Reset Sequence Media Posts
SELECT setval(pg_get_serial_sequence('public.media_posts', 'id'), coalesce(max(id),0) + 1, false) FROM public.media_posts;

-- 8. Reset Sequence Korwils
SELECT setval(pg_get_serial_sequence('public.korwils', 'id'), coalesce(max(id),0) + 1, false) FROM public.korwils;

-- 9. Reset Sequence Site Config (Jika ada import config)
SELECT setval(pg_get_serial_sequence('public.site_config', 'id'), coalesce(max(id),0) + 1, false) FROM public.site_config;

-- Note:
-- Tabel 'attendance_records' dan 'profile_pages' tidak menggunakan Auto-Increment Integer (menggunakan UUID/String),
-- jadi tidak perlu di-reset.
