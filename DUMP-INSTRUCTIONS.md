# Cara Membuat Binary Dump dari Supabase

## 1. Dapatkan Connection String dari Supabase

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **Settings** → **Database**
4. Scroll ke bagian **Connection string**
5. Pilih tab **URI** atau **Connection pooling**
6. Copy connection string, formatnya seperti:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   atau
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

## 2. Jalankan Script

### Opsi A: Menggunakan Script PowerShell
```powershell
.\create-dump.ps1 -ConnectionString "postgresql://postgres:password@host:port/postgres"
```

### Opsi B: Langsung menggunakan pg_dump
```powershell
pg_dump -Fc -f supabase-schema.dump "postgresql://postgres:password@host:port/postgres"
```

## Catatan

- `-Fc` = Format custom (binary, terkompresi)
- File output akan berformat `.dump` (binary)
- Untuk restore: `pg_restore -d database_name supabase-schema.dump`

## Keamanan

⚠️ **Jangan commit connection string ke repository!**
- Gunakan environment variable atau input manual saat menjalankan script
- Connection string berisi password yang sensitif

