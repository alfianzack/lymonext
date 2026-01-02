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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

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

## Catatan

- Aplikasi ini stateless, session disimpan di Supabase
- Tidak ada upload image
- Semua data disimpan di Supabase database

