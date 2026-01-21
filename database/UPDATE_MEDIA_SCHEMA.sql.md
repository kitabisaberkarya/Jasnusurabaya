```sql
-- =================================================================
-- UPDATE SCHEMA - FITUR MEDIA SOSIAL (YOUTUBE & IG)
-- =================================================================

-- 1. Tabel Media Posts
create table if not exists public.media_posts (
  id bigint primary key generated always as identity,
  type text not null, -- 'youtube' or 'instagram'
  url text not null, -- Original URL
  embed_url text not null, -- Processed Embed URL
  caption text,
  created_at text default to_char(now(), 'YYYY-MM-DD')
);

-- 2. Security Policies (RLS)
alter table public.media_posts enable row level security;

-- Reset Policy
drop policy if exists "Public Access Media" on public.media_posts;
drop policy if exists "Admin Manage Media" on public.media_posts;

-- Public can Read
create policy "Public Access Media" on public.media_posts for select using (true);

-- Admin can CRUD
create policy "Admin Manage Media" on public.media_posts for all using (true) with check (true);
```