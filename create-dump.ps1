# Script untuk membuat binary dump dari Supabase database
# Usage: .\create-dump.ps1 -ConnectionString "postgresql://postgres:password@host:port/postgres"

param(
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString,
    
    [string]$OutputFile = "supabase-schema.dump"
)

Write-Host "Membuat binary dump dari database..." -ForegroundColor Green
Write-Host "Output file: $OutputFile" -ForegroundColor Yellow

# Jalankan pg_dump dengan format custom (binary)
pg_dump -Fc -f $OutputFile $ConnectionString

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBinary dump berhasil dibuat: $OutputFile" -ForegroundColor Green
    Write-Host "Ukuran file: $((Get-Item $OutputFile).Length / 1MB) MB" -ForegroundColor Cyan
} else {
    Write-Host "`nError: Gagal membuat dump. Pastikan connection string benar dan pg_dump terinstall." -ForegroundColor Red
    exit 1
}

