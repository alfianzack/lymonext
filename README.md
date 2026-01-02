# Lymo Studio Foto - Aplikasi Keuangan

Aplikasi keuangan berbasis Next.js untuk studio foto yang terintegrasi dengan Supabase.

## Fitur

- ✅ Dashboard dengan ringkasan keuangan bulanan
- ✅ Master Produk & Layanan
- ✅ Input Transaksi Klien
- ✅ Database Klien
- ✅ Log Tugas & Bonus
- ✅ Master Tugas
- ✅ Penggajian Bulanan
- ✅ Biaya Operasional
- ✅ Fix Cost
- ✅ Profit per Invoice
- ✅ Laporan Laba Rugi

## Teknologi

- **Next.js 14** - Framework React dengan App Router
- **TypeScript** - Type safety
- **Supabase** - Database & Authentication
- **PostgreSQL (pg)** - Koneksi langsung ke database menggunakan connection string
- **Tailwind CSS** - Styling
- **Vercel** - Deployment platform

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy URL dan Anon Key dari project settings
3. Buat file `.env.local` di root project:

```env
# Mode Database: 'supabase' untuk REST API, 'local' untuk PostgreSQL direct
# Default: 'supabase'
DATABASE_MODE=supabase

# Supabase Client (untuk authentication dan real-time)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# PostgreSQL Connection String (untuk koneksi langsung ke database)
# Untuk Supabase: Dapatkan dari Dashboard → Settings → Database → Connection string → Connection pooling
# Untuk Local: postgresql://postgres:password@localhost:5432/your_database
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# JWT Secret Key (untuk authentication)
JWT_SECRET=your-secret-key-change-in-production
```

**Catatan**: 
- Ganti `[YOUR-PASSWORD]` dengan password database Anda
- Set `DATABASE_MODE=local` untuk menggunakan PostgreSQL lokal
- Set `DATABASE_MODE=supabase` untuk menggunakan Supabase REST API (default)

### 3. Setup Database

Jalankan SQL script di Supabase SQL Editor untuk membuat tabel-tabel yang diperlukan. Lihat file `supabase-schema.sql` untuk struktur database.

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Deployment ke Vercel

1. Push code ke GitHub repository
2. Import project ke Vercel
3. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL` (connection string PostgreSQL)
4. Deploy!

## Struktur Database

Aplikasi menggunakan tabel-tabel berikut:

- `users` - Data user dengan role (admin/owner)
- `master_produk` - Master produk & layanan
- `database_klien` - Database klien
- `transaksi_penjualan` - Transaksi penjualan
- `master_tugas` - Master jenis tugas
- `master_karyawan` - Master data karyawan
- `log_tugas` - Log tugas harian
- `penggajian` - Data penggajian bulanan
- `biaya_operasional` - Biaya operasional variabel
- `fix_cost` - Biaya tetap bulanan

## Hak Akses

- **Admin**: Input transaksi, log tugas, biaya operasional
- **Owner**: Semua akses termasuk approve, payroll, laporan, dashboard

## Koneksi Database

Aplikasi ini menggunakan dua metode koneksi ke Supabase:

1. **Supabase Client SDK** (`lib/supabase/`) - Untuk authentication dan real-time features
2. **PostgreSQL Direct Connection** (`lib/db/postgres.ts`) - Untuk query SQL langsung menggunakan connection string

### Menggunakan PostgreSQL Direct Connection

```typescript
import { query, transaction } from '@/lib/db/postgres'

// Query sederhana
const result = await query('SELECT * FROM users LIMIT 10')

// Query dengan parameter
const user = await query('SELECT * FROM users WHERE id = $1', [userId])

// Transaction
await transaction(async (client) => {
  await client.query('INSERT INTO ...')
  await client.query('UPDATE ...')
})
```

Lihat file `lib/db/example.ts` untuk contoh penggunaan lebih lengkap.

## Catatan

- Aplikasi ini stateless, session disimpan di Supabase
- Tidak ada upload image
- Semua data disimpan di Supabase database
- Connection string PostgreSQL harus disimpan di environment variable `DATABASE_URL`

