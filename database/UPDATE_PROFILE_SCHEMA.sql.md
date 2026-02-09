
```sql
-- =================================================================
-- UPDATE SCHEMA - FITUR PROFIL (SEJARAH, PENGURUS, KORWIL, AMALIYAH)
-- Description: Menambahkan tabel untuk halaman statis profil
-- SAFETY: Script ini AMAN dijalankan di production. Tidak akan menghapus data.
-- =================================================================

-- 1. Tabel Profile Pages
create table if not exists public.profile_pages (
  slug text primary key, -- 'sejarah', 'pengurus', 'korwil', 'amaliyah'
  title text not null,
  content text, -- HTML Content
  updated_at text default to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- 2. Seeding Data Awal (Default Content)
-- PERUBAHAN PENTING: Menggunakan 'DO NOTHING' agar konten yang sudah diedit admin TIDAK TERTIMPA kembali ke default.
insert into public.profile_pages (slug, title, content)
values 
('sejarah', 'Sejarah Jamiyah', '<h2>Sejarah Berdirinya JSN</h2><p>Isi sejarah singkat organisasi disini...</p>'),
('pengurus', 'Susunan Pengurus Pusat', '<h2>Struktur Organisasi</h2><p>Daftar pengurus pusat...</p>'),
('korwil', 'Daftar Koordinator Wilayah', '<h2>Daftar Koordinator Wilayah</h2>
<p>Berikut adalah daftar wilayah jangkauan Jamiyah Sholawat Nariyah Kota Surabaya beserta koordinator yang dapat dihubungi:</p>
<p><em>(Data di bawah ini terintegrasi langsung dengan database sistem)</em></p>'),
('amaliyah', 'Amaliyah & Wirid Rutin JSN', '<h2>Amaliyah Rutin</h2>
<p>Berikut adalah susunan wirid dan sholawat yang dibaca rutin:</p>
<ul>
  <li>Pembacaan Sholawat Nariyah 4444x</li>
  <li>Rotib Al-Haddad</li>
  <li>Tahlil & Yasin</li>
</ul>')
on conflict (slug) do nothing; 
-- ^^^ DO NOTHING: Jika data sudah ada, biarkan (jangan di-reset).

-- 3. Security Policies (RLS)
alter table public.profile_pages enable row level security;

-- Reset Policy (Hapus policy lama agar bersih, lalu buat ulang)
drop policy if exists "Public Access Profile" on public.profile_pages;
drop policy if exists "Admin Update Profile" on public.profile_pages;
drop policy if exists "Admin Insert Profile" on public.profile_pages;

-- Public can Read
create policy "Public Access Profile" on public.profile_pages for select using (true);

-- Admin/All (simplified for this app context) can Update
create policy "Admin Update Profile" on public.profile_pages for update using (true) with check (true);
create policy "Admin Insert Profile" on public.profile_pages for insert with check (true);
```