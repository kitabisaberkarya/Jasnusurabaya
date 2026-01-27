```sql
-- =================================================================
-- UPDATE SCHEMA - MANAJEMEN SLIDER BERANDA
-- Description: Tabel untuk menyimpan gambar slide/banner halaman utama
-- =================================================================

-- 1. Tabel Sliders
create table if not exists public.sliders (
  id bigint primary key generated always as identity,
  image_url text not null,
  title text,
  description text,
  created_at text default to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
);

-- 2. Security Policies (RLS)
alter table public.sliders enable row level security;

-- Reset Policy
drop policy if exists "Public Read Sliders" on public.sliders;
drop policy if exists "Admin Manage Sliders" on public.sliders;

-- Public can Read (Siapapun bisa melihat slider di beranda)
create policy "Public Read Sliders" on public.sliders for select using (true);

-- Admin can CRUD (Admin bisa tambah/hapus slider)
create policy "Admin Manage Sliders" on public.sliders for all using (true) with check (true);

-- 3. Seeding Data (Opsional - Data Contoh)
insert into public.sliders (image_url, title, description)
values 
('https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop', 'BERKHIDMAT UNTUK UMAT', 'Bergabunglah bersama ribuan jamaah Jamiyah Sholawat Nariyah.'),
('https://images.unsplash.com/photo-1606210122158-eeb10e0823bf?q=80&w=2070&auto=format&fit=crop', 'MEMBANGUN UKHUWAH', 'Mempererat tali persaudaraan sesama muslim melalui lantunan sholawat.')
on conflict (id) do nothing;
```