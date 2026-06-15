# Project Setup: Backend with Bun, ElysiaJS, Drizzle, and MySQL

## Deskripsi Tugas
Buat sebuah project backend baru di dalam folder ini menggunakan teknologi modern berbasis Bun. Project ini akan menggunakan ElysiaJS sebagai web framework, Drizzle sebagai ORM, dan MySQL sebagai database.

## Spesifikasi Teknologi
- **Runtime:** Bun
- **Web Framework:** ElysiaJS
- **ORM:** Drizzle ORM
- **Database:** MySQL

## Langkah-langkah Implementasi (High Level)

1. **Inisialisasi Project:**
   - Inisialisasi project baru menggunakan Bun.
   - Pastikan struktur dasar project (seperti `package.json` dan titik awal entry file, misalnya `index.ts`) telah terbentuk.

2. **Instalasi Dependency:**
   - Tambahkan ElysiaJS ke dalam project.
   - Tambahkan Drizzle ORM, Drizzle Kit (untuk manajemen migrasi), dan driver database MySQL yang didukung oleh Bun (misalnya `mysql2`).

3. **Konfigurasi Database & Drizzle ORM:**
   - Atur konfigurasi koneksi ke database MySQL, gunakan *environment variables* (file `.env`) untuk menyimpan kredensial database dengan aman.
   - Definisikan minimal satu skema tabel sederhana sebagai contoh penggunaan Drizzle.
   - Tambahkan script pada `package.json` untuk menjalankan operasi migrasi dari Drizzle Kit.

4. **Pembuatan Server & Endpoint:**
   - Setup server dasar menggunakan instance dari Elysia.
   - Hubungkan instance database (Drizzle) ke dalam service atau route di Elysia.
   - Buat setidaknya satu endpoint sederhana (contoh: `GET /` atau `GET /health`) yang memverifikasi bahwa server menyala dan koneksi ke database berjalan normal.

5. **Dokumentasi & Pengujian:**
   - Sediakan instruksi singkat tentang cara menyalakan server (misalnya: `bun run dev`) dan cara menjalankan migrasi database.
   - Uji endpoint untuk memastikan server dapat memproses request dengan baik.
