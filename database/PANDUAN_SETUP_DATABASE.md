# Panduan Instalasi Database JSN (Supabase)

Dokumen ini berisi panduan teknis langkah-demi-langkah untuk menyiapkan database backend aplikasi Jamiyah Sholawat Nariyah menggunakan Supabase.

## 1. Persiapan Awal
Pastikan Anda memiliki:
- Akun **Supabase** (Daftar gratis di [supabase.com](https://supabase.com)).
- Akses ke kode sumber aplikasi (file `lib/supabase.ts`).

## 2. Membuat Proyek Supabase
1. Masuk ke Dashboard Supabase.
2. Klik tombol **New Project**.
3. Isi formulir:
   - **Name**: `jsn-database` (atau sesuai keinginan).
   - **Database Password**: Buat password yang kuat (simpan ini).
   - **Region**: Pilih `Singapore` (sgp) untuk latensi terbaik dari Indonesia.
4. Klik **Create new project** dan tunggu hingga proses provisioning selesai (hijau).

## 3. Eksekusi Script SQL (Instalasi Tabel)
Setelah proyek aktif, kita akan membuat struktur tabel untuk mendukung semua menu aplikasi.

1. Di menu sebelah kiri, pilih **SQL Editor** (ikon `>_`).
2. Klik **+ New Query**.
3. Buka file `database/DATABASE_SCHEMA.sql.md` yang ada di proyek ini.
4. **Salin (Copy)** seluruh kode SQL yang ada di dalam blok kode.
5. **Tempel (Paste)** ke dalam editor SQL Supabase.
6. Klik tombol **Run** (pojok kanan bawah).
7. Pastikan muncul notifikasi **Success** di bagian log hasil.

> **Verifikasi:** Pergi ke menu **Table Editor** (ikon tabel di kiri). Anda seharusnya melihat tabel-tabel berikut: `users`, `registrations`, `news`, `gallery`, `attendance_sessions`, `attendance_records`, dan `site_config`.

## 4. Konfigurasi Koneksi Aplikasi
Agar aplikasi web bisa berkomunikasi dengan database, kita perlu memasukkan kunci API.

1. Di Dashboard Supabase, masuk ke **Project Settings** (ikon roda gigi).
2. Pilih menu **API**.
3. Cari bagian **Project URL** dan **anon public key**.
4. Buka file `lib/supabase.ts` di kode sumber aplikasi Anda.
5. Ganti nilai variabel dengan data dari dashboard:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xxxxxxxxxxxx.supabase.co'; // Salin Project URL
const supabaseKey = 'eyJxh...'; // Salin anon public key

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## 5. Uji Coba Login Admin
Database telah diisi dengan data awal (seeding) untuk admin.

1. Jalankan aplikasi: `npm run dev`.
2. Buka halaman Login: `http://localhost:5173/#/login`.
3. Masukkan kredensial default:
   - **Email**: `jasnu.nariyahsurabaya@gmail.com`
   - **Password**: `JasnuNariyahSurabaya1926`
4. Jika berhasil masuk ke Dashboard Admin, instalasi database Sukses!

## Struktur Tabel & Fitur
Berikut adalah pemetaan antara Menu Aplikasi dan Tabel Database:

| Menu Aplikasi (Admin/User) | Tabel Database | Fungsi Utama |
|----------------------------|----------------|--------------|
| **Auth / Login** | `users` | Autentikasi Admin & Member |
| **Approval Anggota** | `registrations` -> `users` | Verifikasi pendaftaran baru |
| **Database Anggota** | `users` | Pencarian & List Member Aktif |
| **Manajemen Berita** | `news` | CRUD Artikel & Kegiatan |
| **Galeri** | `gallery` | Menyimpan dokumentasi |
| **Absensi Majelis** | `attendance_sessions` | Membuat jadwal kegiatan |
| **Member Area (Scan)** | `attendance_records` | Menyimpan log kehadiran, foto, lokasi |
| **Pengaturan Website** | `site_config` | Mengubah nama app, logo, kontak |

## Troubleshooting
- **Gagal Fetch Data (Network Error):** Periksa apakah `supabaseUrl` dan `supabaseKey` di `lib/supabase.ts` sudah benar.
- **Tabel Kosong:** Pastikan Anda sudah menjalankan bagian *SEEDING DATA* pada script SQL.
- **Permission Denied:** Pastikan bagian *SECURITY POLICIES (RLS)* di script SQL sudah dijalankan.