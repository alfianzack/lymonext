# Perubahan Sistem Authentication

## Ringkasan Perubahan

Sistem authentication telah diubah dari Supabase Auth ke custom authentication menggunakan JWT dan tabel `users` di database.

## Perubahan Schema

### Table `users`
- **ID**: Diubah dari `uuid` ke `text` dengan format DDMMYY + 4 digit sequential (menggunakan trigger)
- **Password**: Kolom baru `password text NOT NULL` untuk menyimpan password yang di-hash
- **Email**: Menambahkan constraint `UNIQUE` pada email
- **Foreign Key**: Dihapus foreign key ke `auth.users` karena tidak lagi menggunakan Supabase Auth

### Trigger
- Menambahkan trigger `trigger_users_id` untuk auto-generate ID pada table `users`

## Perubahan Kode

### 1. Login (`app/login/page.tsx`)
- Menggunakan form email dan password
- Mengirim request ke `/api/auth/login`
- Tidak lagi menggunakan Supabase magic link

### 2. API Routes
- **`app/api/auth/login/route.ts`**: Endpoint untuk login
  - Mencari user berdasarkan email
  - Verifikasi password menggunakan bcrypt
  - Generate JWT token
  - Set cookie `auth-token`
  
- **`app/api/auth/logout/route.ts`**: Endpoint untuk logout
  - Menghapus cookie `auth-token`

### 3. Authentication (`lib/auth.ts`)
- Menggunakan JWT dari cookie untuk verifikasi
- Tidak lagi menggunakan Supabase Auth
- Function `getCurrentUser()` membaca dari JWT token

### 4. Middleware (`lib/auth/middleware.ts` & `middleware.ts`)
- Menggunakan JWT verification
- Redirect ke `/login` jika tidak ada token atau token invalid
- Skip auth untuk API routes dan halaman login

### 5. Dummy Data (`lib/db/seed-dummy-data.ts`)
- Menambahkan dummy users dengan password yang di-hash
- Default users:
  - `admin@lymo.com` / `admin123` (role: admin)
  - `owner@lymo.com` / `owner123` (role: owner)
  - `user1@lymo.com` / `user123` (role: admin)
  - `user2@lymo.com` / `user123` (role: admin)

## Dependencies Baru

- `bcryptjs`: Untuk hashing password
- `@types/bcryptjs`: Type definitions untuk bcryptjs
- `jose`: Untuk JWT signing dan verification

## Environment Variables

Tambahkan ke `.env.local`:

```env
JWT_SECRET=your-secret-key-change-in-production
```

**PENTING**: Ganti `your-secret-key-change-in-production` dengan secret key yang kuat di production!

## Cara Menggunakan

1. **Jalankan migration schema**:
   - Update table `users` di Supabase sesuai dengan `supabase-schema.sql`
   - Atau jalankan SQL untuk menambahkan kolom password dan mengubah ID

2. **Jalankan seeding**:
   ```bash
   npm run seed
   ```

3. **Login**:
   - Email: `admin@lymo.com` atau `owner@lymo.com`
   - Password: `admin123` atau `owner123`

## Catatan Keamanan

- Password disimpan dalam bentuk hash menggunakan bcrypt (10 rounds)
- JWT token disimpan di httpOnly cookie untuk mencegah XSS
- Token expire dalam 7 hari
- Pastikan `JWT_SECRET` menggunakan random string yang kuat di production

