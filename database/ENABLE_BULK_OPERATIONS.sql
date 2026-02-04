
-- =================================================================
-- ENABLE BULK OPERATIONS FOR BACKUP & RESTORE
-- Description: Memastikan admin memiliki hak akses penuh (upsert/delete) 
-- untuk semua tabel guna keperluan fitur Restore Database dari JSON.
-- =================================================================

-- 1. SITE CONFIG
drop policy if exists "Admin Restore Config" on public.site_config;
create policy "Admin Restore Config" on public.site_config for all using (true) with check (true);

-- 2. KORWILS
drop policy if exists "Admin Restore Korwils" on public.korwils;
create policy "Admin Restore Korwils" on public.korwils for all using (true) with check (true);

-- 3. USERS (Sudah ada di script sebelumnya, tapi dipertegas)
drop policy if exists "Admin Restore Users" on public.users;
create policy "Admin Restore Users" on public.users for all using (true) with check (true);

-- 4. REGISTRATIONS
drop policy if exists "Admin Restore Registrations" on public.registrations;
create policy "Admin Restore Registrations" on public.registrations for all using (true) with check (true);

-- 5. CONTENT (News, Gallery, Sliders, Media)
drop policy if exists "Admin Restore News" on public.news;
create policy "Admin Restore News" on public.news for all using (true) with check (true);

drop policy if exists "Admin Restore Gallery" on public.gallery;
create policy "Admin Restore Gallery" on public.gallery for all using (true) with check (true);

drop policy if exists "Admin Restore Sliders" on public.sliders;
create policy "Admin Restore Sliders" on public.sliders for all using (true) with check (true);

drop policy if exists "Admin Restore Media" on public.media_posts;
create policy "Admin Restore Media" on public.media_posts for all using (true) with check (true);

drop policy if exists "Admin Restore Profile" on public.profile_pages;
create policy "Admin Restore Profile" on public.profile_pages for all using (true) with check (true);

-- 6. ATTENDANCE
-- Pastikan policy ini ada agar insert ribuan data record sekaligus tidak diblokir
drop policy if exists "Admin Restore Sessions" on public.attendance_sessions;
create policy "Admin Restore Sessions" on public.attendance_sessions for all using (true) with check (true);

drop policy if exists "Admin Restore Records" on public.attendance_records;
create policy "Admin Restore Records" on public.attendance_records for all using (true) with check (true);

-- NOTE: Script ini bersifat idempoten (aman dijalankan berulang).
-- Pastikan dijalankan di SQL Editor Supabase.
