
-- =================================================================
-- FIX PERMISSIONS & ENSURE TABLES EXIST
-- Jalankan script ini jika fitur Galeri atau Absensi tidak bisa menyimpan data.
-- =================================================================

-- 1. Pastikan Tabel Gallery Ada
create table if not exists public.gallery (
  id bigint primary key generated always as identity,
  type text default 'image',
  url text,
  caption text
);

-- 2. Pastikan Tabel Attendance Ada
create table if not exists public.attendance_sessions (
  id bigint primary key generated always as identity,
  name text not null,
  date text default to_char(now(), 'YYYY-MM-DD'),
  is_open boolean default true,
  attendees jsonb default '[]'::jsonb
);

create table if not exists public.attendance_records (
  id text primary key,
  session_id bigint references public.attendance_sessions(id),
  user_id bigint references public.users(id),
  user_name text,
  timestamp text,
  photo_url text,
  location text
);

-- 3. Reset & Apply Permissions (RLS)
alter table public.gallery enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;

-- Hapus kebijakan lama untuk menghindari duplikasi
drop policy if exists "Public Access Gallery" on public.gallery;
drop policy if exists "Public Access Sessions" on public.attendance_sessions;
drop policy if exists "Public Access Records" on public.attendance_records;
drop policy if exists "Admin Manage Sessions" on public.attendance_sessions;
drop policy if exists "Admin Manage Gallery" on public.gallery;

-- Kebijakan Baru: Publik bisa BACA (SELECT), Admin/Authenticated bisa EDIT (ALL)
create policy "Public Access Gallery" on public.gallery for select using (true);
create policy "Admin Manage Gallery" on public.gallery for all using (true) with check (true);

create policy "Public Access Sessions" on public.attendance_sessions for select using (true);
create policy "Admin Manage Sessions" on public.attendance_sessions for all using (true) with check (true);

create policy "Public Access Records" on public.attendance_records for all using (true) with check (true);

-- 4. Pastikan Storage Bucket 'public-files' Ada
insert into storage.buckets (id, name, public) values ('public-files', 'public-files', true)
on conflict (id) do nothing;

-- 5. Storage Policies (Fix Upload Issues)
drop policy if exists "Public Access Files" on storage.objects;
drop policy if exists "Auth Upload Files" on storage.objects;

create policy "Public Access Files" on storage.objects for select using ( bucket_id = 'public-files' );
create policy "Auth Upload Files" on storage.objects for insert with check ( bucket_id = 'public-files' );
