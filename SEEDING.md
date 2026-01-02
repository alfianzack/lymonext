# Panduan Seeding Dummy Data

File ini menjelaskan cara menggunakan script untuk mengisi database dengan dummy data.

## Persiapan

1. Pastikan `DATABASE_URL` sudah di-set di file `.env.local`:
```env
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

2. Pastikan semua dependencies sudah terinstall:
```bash
npm install
```

## Cara Menjalankan

Jalankan salah satu perintah berikut:

```bash
npm run seed
```

atau

```bash
npx tsx lib/db/seed-dummy-data.ts
```

## Data yang Akan Di-insert

Script akan mengisi dummy data ke tabel-tabel berikut:

### 1. Master Produk (10 produk)
- 5 Paket (Prewedding Basic, Premium, Wedding Full Day, Engagement, Family Photo)
- 5 Tambahan (Foto Edit, Cetak 4R, Cetak 8R, Tambah Orang, Video Highlight)

### 2. Database Klien (8 klien)
- Data klien dengan nama, email, telepon, dan alamat

### 3. Master Tugas (7 tugas)
- Fotografi Prewedding, Wedding, Videografi, Editing Foto/Video, Makeup, Dekorasi

### 4. Master Karyawan (5 karyawan)
- Data karyawan dengan gaji pokok

### 5. Transaksi Penjualan (10 invoice)
- Transaksi dari 3 bulan terakhir
- Setiap invoice memiliki 1-3 item produk

### 6. Log Tugas (40-60 log)
- Log tugas dari 2 bulan terakhir
- Status: Pending atau Approved

### 7. Penggajian (10 record)
- Data penggajian dari 2 bulan terakhir
- Otomatis menghitung total bonus dari log_tugas yang approved

### 8. Biaya Operasional (15-30 biaya)
- Biaya operasional dari 3 bulan terakhir
- Kategori: Bahan Baku, Transport, Perawatan, Lain-lain

### 9. Fix Cost (6 biaya tetap)
- Sewa Studio, Listrik, Internet, Air, Asuransi, Pajak

## Catatan

- Script menggunakan `ON CONFLICT DO NOTHING` untuk menghindari duplikasi data
- ID akan di-generate otomatis oleh trigger database (format: DDMMYY + 4 digit sequential)
- Data akan di-insert dalam satu transaction, jadi jika ada error, semua perubahan akan di-rollback
- Untuk tabel `users`, perlu dibuat manual melalui Supabase Auth karena terkait dengan `auth.users`

## Troubleshooting

### Error: DATABASE_URL tidak ditemukan
- Pastikan file `.env.local` ada di root project
- Pastikan `DATABASE_URL` sudah di-set dengan benar

### Error: Connection timeout
- Periksa koneksi internet
- Pastikan connection string benar
- Pastikan Supabase project masih aktif

### Error: Permission denied
- Pastikan user database memiliki permission untuk INSERT ke semua tabel
- Periksa Row Level Security (RLS) policies di Supabase

