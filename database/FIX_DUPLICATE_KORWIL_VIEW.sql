-- =================================================================
-- FIX DUPLICATE DATA ON KORWIL PAGE
-- Description: Menghapus daftar manual (hardcoded) pada konten profil 'korwil'
-- sehingga tidak muncul ganda dengan tabel otomatis yang baru.
-- =================================================================

-- Update konten halaman 'korwil' untuk hanya menyisakan teks pembuka.
-- Daftar wilayah akan otomatis digenerate oleh sistem di bawahnya (mengambil dari tabel korwils).

UPDATE public.profile_pages
SET content = '<h2>Daftar Koordinator Wilayah</h2>
<p>Berikut adalah daftar wilayah jangkauan Jamiyah Sholawat Nariyah Kota Surabaya beserta koordinator yang dapat dihubungi:</p>
<p><em>(Data di bawah ini terintegrasi langsung dengan database sistem)</em></p>'
WHERE slug = 'korwil';

-- Verifikasi: Pastikan data tersimpan
-- SELECT * FROM public.profile_pages WHERE slug = 'korwil';
