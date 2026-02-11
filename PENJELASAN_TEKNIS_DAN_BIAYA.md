*PENJELASAN TEKNIS & JUSTIFIKASI BIAYA PENGEMBANGAN SISTEM JSN*
*Nomor:* 002/DEV/JSN/2025
*Perihal:* Penambahan Fitur Manajemen Bertingkat & Validasi Lokasi Absensi

Berikut adalah rincian teknis, alur logika, dan tingkat kesulitan untuk pengembangan fitur baru pada Sistem Informasi Manajemen JSN Surabaya.

------------------------------------------------

*1. RINCIAN FITUR & KOMPLEKSITAS TEKNIS*ok

Pengembangan ini bukan sekadar menambah tombol, melainkan merombak *Logika Bisnis (Business Logic)* dan *Keamanan Data* dari sistem yang sudah ada.

*A. Multi-Level Authentication & Authorization (Tingkat Kesulitan: TINGGI)*
Sistem login saat ini bersifat Single Admin. Perubahan menjadi 3 tingkat (Super Admin, Pengurus, Korwil) memerlukan perombakan inti sistem keamanan.

1. *Super Admin (Master)*:
   - Akses: Full Control (Edit Database, Hapus Data, Reset Password, Kelola Akun Admin lain).
   - Teknis: Membypass semua Row Level Security (RLS) di database.

2. *Admin Korwil (Koordinator Wilayah)*:
   - Akses: Terbatas hanya pada menu Approval Anggota.
   - Filter Data Otomatis: Sistem harus memfilter data secara cerdas. Admin Korwil "Rungkut" HANYA boleh melihat pendaftar dari wilayah "Rungkut".
   - Teknis: Implementasi Conditional Rendering dan Database Filtering berdasarkan meta-data user.

3. *Admin Pengurus Pusat*:
   - Akses: Approval Tahap Akhir & Melihat Rekapitulasi.
   - Teknis: Hanya bisa melihat data yang statusnya sudah "Disetujui Korwil".

*B. Multi-Tier Approval Workflow (Alur Persetujuan Bertingkat)*
Kami mengubah alur pendaftaran dari Sederhana menjadi Berjenjang untuk validitas data yang lebih ketat.

- *Lama*: Daftar -> Admin Klik Terima -> Aktif.
- *Baru*: Daftar -> Dashboard Korwil (Verifikasi) -> Dashboard Pengurus (Terbit NIA) -> Aktif.

*Implikasi Teknis:*
- Perubahan struktur tabel database (status: pending_korwil, approved_korwil, active).
- Logika backend untuk mencegah bypass alur.

*C. Geofencing Attendance (Absensi Radius) (Tingkat Kesulitan: MENENGAH - TINGGI)*
Fitur ini mencegah kecurangan absensi..

1. *Validasi Jarak (Haversine Formula)*:
   - Sistem menghitung jarak real-time antara GPS HP Anggota dengan Lokasi Majelis.
2. *Radius Locking*:
   - Jika jarak > 100 meter dari lokasi, tombol absen terkunci otomatis.
3. *Manajemen Lokasi Dinamis*:
   - Admin menentukan titik lokasi (Latitude/Longitude) berbeda setiap sesi.

------------------------------------------------

*2. SKEMA ALUR KERJA BARU*

*Alur Pendaftaran:*
1. Calon Anggota isi form -> Status PENDING.
2. Korwil Login -> Cek Warga -> Klik Approve.
3. Pengurus Login -> Cek Data -> Klik Terbit NIA -> Status ACTIVE.

*Alur Absensi (Geofencing):*
1. Admin buat sesi & set lokasi (misal: Masjid Al-Akbar).
2. Anggota klik Absen.
3. Sistem cek GPS.
   - Jarak < 100m: Kamera Buka -> Foto -> Berhasil.
   - Jarak > 100m: Muncul Peringatan "Jarak kejauhan" -> Gagal.

------------------------------------------------

*3. RINCIAN ESTIMASI BIAYA (HARGA KHUSUS)*

Harga *Rp 550.000* adalah harga paket khusus komunitas. Jika dihitung normal:

1. *Database Restructuring* (Update Tabel User, Role, Status)
   - Normal: Rp 300.000
   - JSN: Termasuk

2. *Logic Multi-Role* (3 Level Login)
   - Normal: Rp 750.000
   - JSN: Termasuk

3. *Fitur Geofencing* (Radius & GPS)
   - Normal: Rp 500.000
   - JSN: Termasuk

4. *Testing & Deployment*
   - Normal: Rp 200.000
   - JSN: Termasuk

*TOTAL ESTIMASI NORMAL:* Rp 1.750.000
*HARGA PENAWARAN JSN:* Rp 550.000

*Kenapa Rp 550.000?*
1. *Support Dakwah*: Kontribusi pengembang untuk majelis.
2. *Efisiensi*: Menggunakan basis kode yang sudah ada, hanya refactoring modul kunci.

------------------------------------------------

*4. KESIMPULAN*

Dengan investasi *Rp 550.000*, sistem JSN mendapatkan upgrade setara aplikasi korporat:
1. *Validitas Data Terjamin* (2 pintu verifikasi).
2. *Absensi Jujur* (Anti titip absen/absen dari rumah).
3. *Hierarki Jelas* (Beban kerja admin terbagi).

Hormat Kami,
*Tim Pengembang*