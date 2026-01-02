# Konfigurasi Mode Database

Aplikasi ini mendukung dua mode database:
1. **Supabase REST API** - Menggunakan Supabase client SDK
2. **PostgreSQL Local** - Menggunakan koneksi langsung ke PostgreSQL

## Environment Variable

Tambahkan ke `.env.local`:

```env
# Mode database: 'supabase' atau 'local'
# Default: 'supabase'
DATABASE_MODE=supabase
```

atau untuk PostgreSQL lokal:

```env
DATABASE_MODE=local
```

## Penggunaan

### Mode Supabase (REST API)
```env
DATABASE_MODE=supabase
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Mode Local (PostgreSQL Direct)
```env
DATABASE_MODE=local
DATABASE_URL=postgresql://postgres:password@localhost:5432/your_database
```

## Cara Kerja

Aplikasi akan otomatis menggunakan:
- **Supabase REST API** jika `DATABASE_MODE=supabase` atau tidak di-set
- **PostgreSQL Direct Connection** jika `DATABASE_MODE=local`

## Contoh Penggunaan di Code

```typescript
import { fetchMasterProduk, insertMasterProduk } from '@/lib/db/data-fetcher'

// Fetch data (otomatis switch berdasarkan DATABASE_MODE)
const produk = await fetchMasterProduk({
  order: 'id_produk',
  dir: 'asc',
  aktif: true
})

// Insert data
const newProduk = await insertMasterProduk({
  id_produk: 'PKT001',
  nama_produk: 'Paket Prewedding',
  kategori: 'Paket',
  harga_jual: 5000000,
  satuan: 'Paket',
  aktif: true
})
```

## Catatan

- Untuk **development/testing lokal**: Gunakan `DATABASE_MODE=local`
- Untuk **production dengan Supabase**: Gunakan `DATABASE_MODE=supabase`
- Mode akan otomatis terdeteksi saat aplikasi start

