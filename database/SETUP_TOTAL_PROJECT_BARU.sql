-- =================================================================
-- SCRIPT SETUP TOTAL UNTUK PROJECT SUPABASE BARU (KOSONG) - REVISI
-- Jalankan script ini SEKALI SAJA di SQL Editor untuk membangun seluruh sistem.
-- =================================================================

-- 1. BUAT TABEL USERS (PENTING UNTUK LOGIN)
CREATE TABLE IF NOT EXISTS public.users (
  id bigint primary key generated always as identity,
  name text not null,
  email text,
  role text default 'member', -- 'admin', 'korwil', 'pengurus', 'member'
  status text default 'active',
  nia text unique,
  nik text unique,
  password text not null,
  wilayah text,
  phone text,
  address text,
  profile_photo_url text,
  joined_at text default to_char(now(), 'YYYY-MM-DD')
);

-- 2. BUAT TABEL KONFIGURASI WEBSITE
CREATE TABLE IF NOT EXISTS public.site_config (
  id bigint primary key generated always as identity,
  app_name text,
  org_name text,
  description text,
  address text,
  email text,
  phone text,
  logo_url text,
  signature_url text,
  stamp_url text
);

-- 3. BUAT TABEL LAINNYA (Berita, Galeri, Absensi, dll)
CREATE TABLE IF NOT EXISTS public.registrations (
  id bigint primary key generated always as identity,
  name text not null,
  nik text unique,
  email text,
  phone text,
  address text,
  wilayah text,
  password text,
  status text default 'pending',
  date text default to_char(now(), 'YYYY-MM-DD')
);

CREATE TABLE IF NOT EXISTS public.news (
  id bigint primary key generated always as identity,
  title text not null,
  excerpt text,
  content text,
  date text default to_char(now(), 'YYYY-MM-DD'),
  image_url text
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id bigint primary key generated always as identity,
  type text default 'image',
  url text,
  caption text
);

CREATE TABLE IF NOT EXISTS public.sliders (
  id bigint primary key generated always as identity,
  image_url text not null,
  title text,
  description text
);

CREATE TABLE IF NOT EXISTS public.media_posts (
  id bigint primary key generated always as identity,
  type text not null,
  url text,
  embed_url text,
  caption text,
  created_at text default to_char(now(), 'YYYY-MM-DD')
);

CREATE TABLE IF NOT EXISTS public.profile_pages (
  slug text primary key,
  title text,
  content text,
  updated_at text
);

CREATE TABLE IF NOT EXISTS public.korwils (
  id bigint primary key generated always as identity,
  name text not null unique,
  coordinator_name text,
  contact text
);

CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id bigint primary key generated always as identity,
  name text not null,
  date text default to_char(now(), 'YYYY-MM-DD'),
  is_open boolean default true,
  attendees jsonb default '[]'::jsonb,
  latitude double precision,
  longitude double precision,
  radius integer default 100,
  maps_url text
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id text primary key default gen_random_uuid()::text,
  session_id bigint references public.attendance_sessions(id),
  user_id bigint references public.users(id),
  user_name text,
  timestamp text,
  photo_url text,
  location text,
  distance double precision
);

-- 4. INSERT DATA ADMIN (WAJIB UNTUK BISA LOGIN PERTAMA KALI)
-- Hapus dulu jika ada duplikat (untuk safety)
DELETE FROM public.users WHERE email = 'jasnu.nariyahsurabaya@gmail.com';

INSERT INTO public.users (name, email, role, status, nia, password, wilayah, joined_at)
VALUES (
  'Administrator JSN', 
  'jasnu.nariyahsurabaya@gmail.com', 
  'admin', 
  'active', 
  'ADMIN-MASTER', 
  'JasnuNariyahSurabaya1926', 
  'Pusat', 
  '2025-01-01'
);

-- 5. INSERT DEFAULT CONFIG
INSERT INTO public.site_config (app_name, org_name, description, email, phone)
SELECT 'JSN Surabaya', 'Jamiyah Sholawat Nariyah', 'Sistem Informasi Manajemen', 'info@jsn.com', '-'
WHERE NOT EXISTS (SELECT 1 FROM public.site_config);

-- 6. SETUP KEAMANAN (RLS POLICIES) - AGAR BISA LOGIN
-- Mengaktifkan RLS pada semua tabel
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.korwils ENABLE ROW LEVEL SECURITY;

-- == 6.1 Users Policy ==
DROP POLICY IF EXISTS "Public Read Users" ON public.users;
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Users" ON public.users;
CREATE POLICY "Admin Manage Users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- == 6.2 Config Policy ==
DROP POLICY IF EXISTS "Public Read Config" ON public.site_config;
CREATE POLICY "Public Read Config" ON public.site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Update Config" ON public.site_config;
CREATE POLICY "Admin Update Config" ON public.site_config FOR ALL USING (true) WITH CHECK (true);

-- == 6.3 News Policy ==
DROP POLICY IF EXISTS "Public Read All News" ON public.news;
CREATE POLICY "Public Read All News" ON public.news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage News" ON public.news;
CREATE POLICY "Admin Manage News" ON public.news FOR ALL USING (true) WITH CHECK (true);

-- == 6.4 Gallery Policy ==
DROP POLICY IF EXISTS "Public Read All Gallery" ON public.gallery;
CREATE POLICY "Public Read All Gallery" ON public.gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Gallery" ON public.gallery;
CREATE POLICY "Admin Manage Gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);

-- == 6.5 Registrations Policy ==
DROP POLICY IF EXISTS "Public Read Registrations" ON public.registrations;
CREATE POLICY "Public Read Registrations" ON public.registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Registrations" ON public.registrations;
CREATE POLICY "Admin Manage Registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);

-- == 6.6 Attendance Policy (Sessions & Records) ==
DROP POLICY IF EXISTS "Public Read Sessions" ON public.attendance_sessions;
CREATE POLICY "Public Read Sessions" ON public.attendance_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Manage Sessions" ON public.attendance_sessions;
CREATE POLICY "Admin Manage Sessions" ON public.attendance_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Records" ON public.attendance_records;
CREATE POLICY "Public Read Records" ON public.attendance_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage Records" ON public.attendance_records;
CREATE POLICY "Manage Records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

-- == 6.7 Other Tables (Sliders, Media, Profile, Korwils) ==
DROP POLICY IF EXISTS "Public Read Sliders" ON public.sliders;
CREATE POLICY "Public Read Sliders" ON public.sliders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Sliders" ON public.sliders;
CREATE POLICY "Admin Manage Sliders" ON public.sliders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Media" ON public.media_posts;
CREATE POLICY "Public Read Media" ON public.media_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Media" ON public.media_posts;
CREATE POLICY "Admin Manage Media" ON public.media_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Profile" ON public.profile_pages;
CREATE POLICY "Public Read Profile" ON public.profile_pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Profile" ON public.profile_pages;
CREATE POLICY "Admin Manage Profile" ON public.profile_pages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Korwils" ON public.korwils;
CREATE POLICY "Public Read Korwils" ON public.korwils FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Korwils" ON public.korwils;
CREATE POLICY "Admin Manage Korwils" ON public.korwils FOR ALL USING (true) WITH CHECK (true);

-- 7. SETUP STORAGE (UNTUK GAMBAR)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public-files', 'public-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Select Storage" ON storage.objects;
CREATE POLICY "Public Select Storage" ON storage.objects FOR SELECT USING ( bucket_id = 'public-files' );

DROP POLICY IF EXISTS "Auth Upload Storage" ON storage.objects;
CREATE POLICY "Auth Upload Storage" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'public-files' );
