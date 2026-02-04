
-- =================================================================
-- SETUP SUPABASE STORAGE FOR IMAGE UPLOADS
-- Description: Membuat bucket 'public-files' dan mengatur RLS Policy
-- agar publik bisa melihat gambar, tapi hanya admin yang bisa upload.
-- =================================================================

-- 1. Create Bucket 'public-files' (Jika belum ada)
insert into storage.buckets (id, name, public) 
values ('public-files', 'public-files', true)
on conflict (id) do nothing;

-- 2. Reset Policies (Hapus policy lama agar bersih)
drop policy if exists "Public Access Files" on storage.objects;
drop policy if exists "Auth Upload Files" on storage.objects;
drop policy if exists "Auth Update Files" on storage.objects;
drop policy if exists "Auth Delete Files" on storage.objects;

-- 3. Create Policies

-- POLICY: Siapapun (Public) boleh MELIHAT file (untuk tampil di website)
create policy "Public Access Files" 
on storage.objects for select 
using ( bucket_id = 'public-files' );

-- POLICY: Hanya User Login (Authenticated) yang boleh UPLOAD
create policy "Auth Upload Files" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id = 'public-files' );

-- POLICY: Hanya User Login yang boleh UPDATE file
create policy "Auth Update Files" 
on storage.objects for update 
to authenticated 
with check ( bucket_id = 'public-files' );

-- POLICY: Hanya User Login yang boleh DELETE file
create policy "Auth Delete Files" 
on storage.objects for delete 
to authenticated 
using ( bucket_id = 'public-files' );
