# Panduan Implementasi Fitur Login User (dengan Remember Me)

Halo! Dokumen ini adalah panduan spesifik dan langkah-demi-langkah (step-by-step) untuk mengimplementasikan fitur autentikasi (login) user dengan kapabilitas "remember me".

## Tujuan
Membuat endpoint API untuk login user. Jika user menyertakan opsi `rememberMe` saat login, sistem akan membuatkan session token (berbasis UUID) dan menyimpannya ke dalam database pada tabel baru `sessions`.

---

## Tahap 1: Perbarui Skema Database (Tabel Sessions)

Kita perlu membuat tabel baru bernama `sessions` menggunakan Drizzle ORM.
1. Buka file `src/db/schema.ts`.
2. Tambahkan skema tabel `sessions` dengan spesifikasi berikut:
   - `id`: integer, auto increment, primary key
   - `userId`: integer, tidak boleh kosong (not null), dan bertindak sebagai *foreign key* yang merujuk ke tabel `users`.
   - `token`: varchar(255), tidak boleh kosong (not null). Kolom ini menyimpan string UUID yang digenerate otomatis.
   - `createdAt`: timestamp, nilai default adalah waktu sekarang (current timestamp).
   - `updatedAt`: timestamp, nilai default adalah waktu sekarang, dan otomatis diperbarui saat ada *update* (on update current timestamp).

**Contoh Definisi Skema (Drizzle):**
```typescript
import { mysqlTable, serial, varchar, timestamp, int } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// (Asumsikan tabel users sudah ada di atas)
// export const users = ...

export const sessions = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
```

3. Jalankan migrasi database di terminal untuk menerapkan tabel `sessions` ke MySQL:
   - `bun run db:generate`
   - `bun run db:migrate`

---

## Tahap 2: Pembuatan Logika Bisnis (Auth Services)

1. Buat file baru bernama `auth-services.ts` di dalam folder `src/services/`.
2. Di dalam file ini, buatlah sebuah fungsi `loginUser(payload)` yang bertugas memproses data login. Data yang diterima berupa email, password, dan nilai boolean opsional `rememberMe`.
3. **Langkah-langkah di dalam fungsi `loginUser`**:
   - **Pengecekan Email**: Cari user di tabel `users` berdasarkan email. Jika tidak ditemukan, lemparkan error (`throw new Error("Kredensial tidak valid");`).
   - **Verifikasi Password**: Gunakan `Bun.password.verify` untuk membandingkan password mentah dengan password ter-hash yang ada di database. Jika tidak cocok, lemparkan error (`throw new Error("Kredensial tidak valid");`).
   - **Pembuatan Token (Remember Me)**:
     - Jika payload `rememberMe` bernilai `true`, buat UUID string baru (misalnya menggunakan `crypto.randomUUID()`).
     - Lakukan insert ke tabel `sessions` yang berisi `userId` dan `token` tersebut.
     - Kembalikan response yang memuat data user (tanpa password) beserta `token` tersebut.
     - Jika `rememberMe` tidak dicentang atau bernilai `false`, kembalikan data user saja (tanpa token).

---

## Tahap 3: Pembuatan Endpoint API (Auth Routes)

1. Buat file baru bernama `auth-routes.ts` di dalam folder `src/routes/`.
2. Buat instance Elysia baru dan atur awalan routing ke `/api`.
   ```typescript
   import { Elysia, t } from "elysia";
   import { loginUser } from "../services/auth-services";

   export const authRoutes = new Elysia({ prefix: "/api" });
   ```
3. Tambahkan endpoint `POST /login`.
4. **Skema Validasi Request Body**:
   Gunakan validator `t.Object` bawaan Elysia:
   ```typescript
   {
     body: t.Object({
       email: t.String({ format: "email" }),
       password: t.String({ minLength: 1 }),
       rememberMe: t.Optional(t.Boolean())
     })
   }
   ```
5. **Implementasi Handler Route**:
   - Di dalam blok `try`, panggil fungsi `loginUser(body)`.
   - Tetapkan status response ke `200` OK.
   - Di blok `catch`, jika pesannya adalah `"Kredensial tidak valid"`, atur status menjadi `401` Unauthorized. Jika error lain, atur `500`.

### Spesifikasi Response Body

**✅ Sukses (200 OK) - Tanpa Remember Me**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

**✅ Sukses (200 OK) - Dengan Remember Me (Token Diberikan)**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "token": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**❌ Error Kredensial Salah (401 Unauthorized)**
```json
{
  "success": false,
  "message": "Kredensial tidak valid"
}
```

---

## Tahap 4: Mendaftarkan Route ke Aplikasi Utama

1. Buka file utama server di `src/index.ts`.
2. Impor `authRoutes` dari `src/routes/auth-routes.ts`.
3. Daftarkan module tersebut ke instance aplikasi utama.
   ```typescript
   app.use(authRoutes);
   ```

---

## Tahap 5: Pengujian Fitur (Testing)

Jalankan server menggunakan:
```bash
bun run dev
```

Kirimkan HTTP POST request ke `http://localhost:3000/api/login`.
**Langkah pengujian:**
1. Coba login dengan kredensial yang salah / belum terdaftar. Pastikan response menolak dengan status HTTP 401 dan pesan "Kredensial tidak valid".
2. Coba login dengan kredensial benar dengan body `"rememberMe": true`. Pastikan mengembalikan data `user` dan `token`, serta token UUID tersimpan di tabel `sessions`.
3. Coba login dengan kredensial benar tanpa `rememberMe`. Pastikan mengembalikan sukses, namun atribut `token` tidak ada.
