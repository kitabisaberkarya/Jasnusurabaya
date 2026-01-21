```sql
-- =================================================================
-- UPDATE SCHEMA - FITUR PROFIL (SEJARAH, PENGURUS, KORWIL)
-- Description: Menambahkan tabel untuk halaman statis profil
-- =================================================================

-- 1. Tabel Profile Pages
create table if not exists public.profile_pages (
  slug text primary key, -- 'sejarah', 'pengurus', 'korwil'
  title text not null,
  content text, -- HTML Content
  updated_at text default to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- 2. Seeding Data Awal (Default Content)
insert into public.profile_pages (slug, title, content)
values 
('sejarah', 'Sejarah Jamiyah', '<h2>Sejarah Berdirinya JSN</h2><p>Isi sejarah singkat organisasi disini...</p>'),
('pengurus', 'Susunan Pengurus Pusat', '<h2>Struktur Organisasi</h2><p>Daftar pengurus pusat...</p>'),
('korwil', 'Koordinator Wilayah', '<h2>Data Koordinator Wilayah</h2><p>Daftar korwil...</p>')
on conflict (slug) do nothing;

-- 3. Security Policies (RLS)
alter table public.profile_pages enable row level security;

-- Reset Policy
drop policy if exists "Public Access Profile" on public.profile_pages;
drop policy if exists "Admin Update Profile" on public.profile_pages;

-- Public can Read
create policy "Public Access Profile" on public.profile_pages for select using (true);

-- Admin/All (simplified for this app context) can Update
create policy "Admin Update Profile" on public.profile_pages for update using (true) with check (true);
create policy "Admin Insert Profile" on public.profile_pages for insert with check (true);
```