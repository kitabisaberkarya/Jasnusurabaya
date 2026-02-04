
-- =================================================================
-- SEED DATA UNTUK VISUALISASI CHART (OPSIONAL)
-- Jalankan script ini jika database Anda masih kosong atau sedikit data,
-- agar grafik di dashboard terlihat bagus saat demo.
-- =================================================================

-- 1. Insert Dummy Users (Tanggal Joined Mundur 1 Tahun)
INSERT INTO public.users (name, email, role, status, nia, password, wilayah, joined_at)
VALUES 
('Anggota Demo 1', 'demo1@example.com', 'member', 'active', 'JSN-2023-001', 'password', 'Rungkut Kidul', '2023-10-15'),
('Anggota Demo 2', 'demo2@example.com', 'member', 'active', 'JSN-2023-002', 'password', 'Kalirungkut', '2023-11-20'),
('Anggota Demo 3', 'demo3@example.com', 'member', 'active', 'JSN-2023-003', 'password', 'Pandugo', '2023-12-05'),
('Anggota Demo 4', 'demo4@example.com', 'member', 'active', 'JSN-2024-001', 'password', 'Kedung Baruk', '2024-01-10'),
('Anggota Demo 5', 'demo5@example.com', 'member', 'active', 'JSN-2024-002', 'password', 'Wonorejo', '2024-01-25'),
('Anggota Demo 6', 'demo6@example.com', 'member', 'active', 'JSN-2024-003', 'password', 'Rungkut Kidul', '2024-02-14'),
('Anggota Demo 7', 'demo7@example.com', 'member', 'active', 'JSN-2024-004', 'password', 'Medokan Ayu', '2024-02-28'),
('Anggota Demo 8', 'demo8@example.com', 'member', 'active', 'JSN-2024-005', 'password', 'Tenggilis Mejoyo', '2024-03-05'),
('Anggota Demo 9', 'demo9@example.com', 'member', 'active', 'JSN-2024-006', 'password', 'Rungkut Kidul', '2024-03-20')
ON CONFLICT DO NOTHING;

-- 2. Insert Dummy Sessions & Attendees
-- Sesi 1
INSERT INTO public.attendance_sessions (name, date, is_open, attendees)
VALUES ('Majelis Rutin Oktober', '2023-10-30', false, '[1,2,3,999999]'::jsonb);

-- Sesi 2
INSERT INTO public.attendance_sessions (name, date, is_open, attendees)
VALUES ('Majelis Rutin November', '2023-11-28', false, '[1,2,3,4,5]'::jsonb);

-- Sesi 3
INSERT INTO public.attendance_sessions (name, date, is_open, attendees)
VALUES ('Majelis Akbar Maulid', '2023-12-25', false, '[1,2,3,4,5,6,7,999999]'::jsonb);

-- Sesi 4
INSERT INTO public.attendance_sessions (name, date, is_open, attendees)
VALUES ('Pengajian Awal Tahun', '2024-01-15', false, '[2,4,6,8]'::jsonb);

-- Sesi 5
INSERT INTO public.attendance_sessions (name, date, is_open, attendees)
VALUES ('Rutinan Februari', '2024-02-10', false, '[1,3,5,7,9]'::jsonb);

-- Sesi 6 (Terbaru)
INSERT INTO public.attendance_sessions (name, date, is_open, attendees)
VALUES ('Majelis Nisfu Syaban', '2024-02-24', true, '[1,2,3,4,5,6,7,8,9,999999]'::jsonb);
