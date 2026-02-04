
-- =================================================================
-- OPTIMIZE CONTENT STORAGE FOR RICH TEXT
-- Description: Script ini memastikan kolom konten pada tabel berita dan profil
-- memiliki tipe data yang sesuai untuk menyimpan HTML panjang.
-- =================================================================

-- 1. Pastikan kolom content pada tabel NEWS bertipe TEXT (Unlimited length)
ALTER TABLE public.news ALTER COLUMN content TYPE text;

-- 2. Pastikan kolom content pada tabel PROFILE_PAGES bertipe TEXT
ALTER TABLE public.profile_pages ALTER COLUMN content TYPE text;

-- 3. (Opsional) Tambahkan Index untuk Pencarian Full Text
-- Ini akan memudahkan pencarian artikel di masa depan.
CREATE INDEX IF NOT EXISTS news_content_search_idx ON public.news USING GIN (to_tsvector('indonesian', content));

-- =================================================================
-- CATATAN:
-- PostgreSQL tipe 'TEXT' dapat menyimpan string dengan panjang tak terbatas (hingga 1GB).
-- Ini sangat aman untuk konten HTML dari Rich Text Editor.
-- =================================================================
