/**
 * File untuk insert dummy data ke semua tabel
 * 
 * Cara menggunakan:
 * 1. Pastikan DATABASE_URL sudah di-set di .env.local
 * 2. Jalankan: npm run seed
 *    atau
 *    npx tsx lib/db/seed-dummy-data.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local SEBELUM import postgres
config({ path: resolve(process.cwd(), '.env.local') })

// Setelah dotenv di-load, baru import postgres
import { query, transaction, closePool } from './postgres'
import bcrypt from 'bcryptjs'

// Helper untuk generate UUID (untuk users)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Helper untuk format tanggal
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper untuk format periode (YYYY-MM)
function formatPeriode(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export async function seedDummyData() {
  console.log('🌱 Mulai seeding dummy data...')

  try {
    await transaction(async (client) => {
      // 0. Users (dengan password)
      console.log('👤 Inserting users...')
      const usersData = [
        { email: 'admin@lymo.com', password: 'admin123', role: 'admin' },
        { email: 'owner@lymo.com', password: 'owner123', role: 'owner' },
        { email: 'user1@lymo.com', password: 'user123', role: 'admin' },
        { email: 'user2@lymo.com', password: 'user123', role: 'admin' },
      ]

      for (const user of usersData) {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10)
        
        await client.query(
          `INSERT INTO users (email, password, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (email) DO NOTHING`,
          [user.email, hashedPassword, user.role]
        )
      }
      console.log('✅ Users created. Default passwords: admin123, owner123, user123')

      // 1. Master Produk
      console.log('📦 Inserting master_produk...')
      const produkData = [
        { id_produk: 'PKT001', nama_produk: 'Paket Prewedding Basic', kategori: 'Paket', harga_jual: 5000000, satuan: 'Paket' },
        { id_produk: 'PKT002', nama_produk: 'Paket Prewedding Premium', kategori: 'Paket', harga_jual: 8000000, satuan: 'Paket' },
        { id_produk: 'PKT003', nama_produk: 'Paket Wedding Full Day', kategori: 'Paket', harga_jual: 12000000, satuan: 'Paket' },
        { id_produk: 'PKT004', nama_produk: 'Paket Engagement', kategori: 'Paket', harga_jual: 3000000, satuan: 'Paket' },
        { id_produk: 'PKT005', nama_produk: 'Paket Family Photo', kategori: 'Paket', harga_jual: 2500000, satuan: 'Paket' },
        { id_produk: 'TMB001', nama_produk: 'Tambah Foto Edit', kategori: 'Tambahan', harga_jual: 50000, satuan: 'File' },
        { id_produk: 'TMB002', nama_produk: 'Tambah Cetak 4R', kategori: 'Tambahan', harga_jual: 3000, satuan: 'Cetak' },
        { id_produk: 'TMB003', nama_produk: 'Tambah Cetak 8R', kategori: 'Tambahan', harga_jual: 10000, satuan: 'Cetak' },
        { id_produk: 'TMB004', nama_produk: 'Tambah Orang', kategori: 'Tambahan', harga_jual: 200000, satuan: 'Orang' },
        { id_produk: 'TMB005', nama_produk: 'Tambah Video Highlight', kategori: 'Tambahan', harga_jual: 1500000, satuan: 'Paket' },
      ]

      for (const produk of produkData) {
        await client.query(
          `INSERT INTO master_produk (id_produk, nama_produk, kategori, harga_jual, satuan, aktif)
           VALUES ($1, $2, $3, $4, $5, true)
           ON CONFLICT (id_produk) DO NOTHING`,
          [produk.id_produk, produk.nama_produk, produk.kategori, produk.harga_jual, produk.satuan]
        )
      }

      // 2. Database Klien
      console.log('👥 Inserting database_klien...')
      const klienData = [
        { id_klien: 'KLN001', nama_klien: 'Budi Santoso', email: 'budi@email.com', telepon: '081234567890', alamat: 'Jl. Merdeka No. 123, Jakarta' },
        { id_klien: 'KLN002', nama_klien: 'Siti Nurhaliza', email: 'siti@email.com', telepon: '081234567891', alamat: 'Jl. Sudirman No. 456, Jakarta' },
        { id_klien: 'KLN003', nama_klien: 'Ahmad Fauzi', email: 'ahmad@email.com', telepon: '081234567892', alamat: 'Jl. Thamrin No. 789, Jakarta' },
        { id_klien: 'KLN004', nama_klien: 'Dewi Lestari', email: 'dewi@email.com', telepon: '081234567893', alamat: 'Jl. Gatot Subroto No. 321, Jakarta' },
        { id_klien: 'KLN005', nama_klien: 'Rizki Pratama', email: 'rizki@email.com', telepon: '081234567894', alamat: 'Jl. Kuningan No. 654, Jakarta' },
        { id_klien: 'KLN006', nama_klien: 'Maya Sari', email: 'maya@email.com', telepon: '081234567895', alamat: 'Jl. Senopati No. 987, Jakarta' },
        { id_klien: 'KLN007', nama_klien: 'Indra Gunawan', email: 'indra@email.com', telepon: '081234567896', alamat: 'Jl. Kebayoran No. 147, Jakarta' },
        { id_klien: 'KLN008', nama_klien: 'Ratna Dewi', email: 'ratna@email.com', telepon: '081234567897', alamat: 'Jl. Cikini No. 258, Jakarta' },
      ]

      for (const klien of klienData) {
        await client.query(
          `INSERT INTO database_klien (id_klien, nama_klien, email, telepon, alamat)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id_klien) DO NOTHING`,
          [klien.id_klien, klien.nama_klien, klien.email, klien.telepon, klien.alamat]
        )
      }

      // 3. Master Tugas
      console.log('📋 Inserting master_tugas...')
      const tugasData = [
        { id_tugas: 'TSK001', nama_tugas: 'Fotografi Prewedding', bonus_per_unit: 500000 },
        { id_tugas: 'TSK002', nama_tugas: 'Fotografi Wedding', bonus_per_unit: 750000 },
        { id_tugas: 'TSK003', nama_tugas: 'Videografi', bonus_per_unit: 1000000 },
        { id_tugas: 'TSK004', nama_tugas: 'Editing Foto', bonus_per_unit: 100000 },
        { id_tugas: 'TSK005', nama_tugas: 'Editing Video', bonus_per_unit: 250000 },
        { id_tugas: 'TSK006', nama_tugas: 'Makeup Artist', bonus_per_unit: 300000 },
        { id_tugas: 'TSK007', nama_tugas: 'Dekorasi', bonus_per_unit: 200000 },
      ]

      for (const tugas of tugasData) {
        await client.query(
          `INSERT INTO master_tugas (id_tugas, nama_tugas, bonus_per_unit, aktif)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (id_tugas) DO NOTHING`,
          [tugas.id_tugas, tugas.nama_tugas, tugas.bonus_per_unit]
        )
      }

      // 4. Master Karyawan
      console.log('👔 Inserting master_karyawan...')
      const karyawanData = [
        { id_karyawan: 'KRY001', nama_karyawan: 'Andi Wijaya', gaji_pokok: 5000000 },
        { id_karyawan: 'KRY002', nama_karyawan: 'Bambang Surya', gaji_pokok: 4500000 },
        { id_karyawan: 'KRY003', nama_karyawan: 'Citra Permata', gaji_pokok: 4000000 },
        { id_karyawan: 'KRY004', nama_karyawan: 'Dedi Kurniawan', gaji_pokok: 5500000 },
        { id_karyawan: 'KRY005', nama_karyawan: 'Eka Putri', gaji_pokok: 4200000 },
      ]

      for (const karyawan of karyawanData) {
        await client.query(
          `INSERT INTO master_karyawan (id_karyawan, nama_karyawan, gaji_pokok, aktif)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (id_karyawan) DO NOTHING`,
          [karyawan.id_karyawan, karyawan.nama_karyawan, karyawan.gaji_pokok]
        )
      }

      // 5. Transaksi Penjualan (3 bulan terakhir)
      console.log('💰 Inserting transaksi_penjualan...')
      const today = new Date()
      const invoices = [
        { no_invoice: 'INV-2024-001', id_klien: 'KLN001', tanggal: new Date(today.getFullYear(), today.getMonth() - 2, 5) },
        { no_invoice: 'INV-2024-002', id_klien: 'KLN002', tanggal: new Date(today.getFullYear(), today.getMonth() - 2, 12) },
        { no_invoice: 'INV-2024-003', id_klien: 'KLN003', tanggal: new Date(today.getFullYear(), today.getMonth() - 2, 18) },
        { no_invoice: 'INV-2024-004', id_klien: 'KLN004', tanggal: new Date(today.getFullYear(), today.getMonth() - 1, 3) },
        { no_invoice: 'INV-2024-005', id_klien: 'KLN005', tanggal: new Date(today.getFullYear(), today.getMonth() - 1, 10) },
        { no_invoice: 'INV-2024-006', id_klien: 'KLN001', tanggal: new Date(today.getFullYear(), today.getMonth() - 1, 20) },
        { no_invoice: 'INV-2024-007', id_klien: 'KLN006', tanggal: new Date(today.getFullYear(), today.getMonth() - 1, 25) },
        { no_invoice: 'INV-2024-008', id_klien: 'KLN007', tanggal: new Date(today.getFullYear(), today.getMonth(), 2) },
        { no_invoice: 'INV-2024-009', id_klien: 'KLN008', tanggal: new Date(today.getFullYear(), today.getMonth(), 8) },
        { no_invoice: 'INV-2024-010', id_klien: 'KLN002', tanggal: new Date(today.getFullYear(), today.getMonth(), 15) },
      ]

      const produkIds = ['PKT001', 'PKT002', 'PKT003', 'PKT004', 'PKT005', 'TMB001', 'TMB002', 'TMB003', 'TMB004', 'TMB005']
      const produkNama = [
        'Paket Prewedding Basic', 'Paket Prewedding Premium', 'Paket Wedding Full Day',
        'Paket Engagement', 'Paket Family Photo', 'Tambah Foto Edit', 'Tambah Cetak 4R',
        'Tambah Cetak 8R', 'Tambah Orang', 'Tambah Video Highlight'
      ]

      for (const invoice of invoices) {
        // Setiap invoice punya 1-3 item
        const itemCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < itemCount; i++) {
          const produkIndex = Math.floor(Math.random() * produkIds.length)
          const id_produk = produkIds[produkIndex]
          const nama_produk = produkNama[produkIndex]
          const kategori = id_produk.startsWith('PKT') ? 'Paket' : 'Tambahan'
          const qty = kategori === 'Paket' ? 1 : Math.floor(Math.random() * 5) + 1
          
          // Get harga dari master_produk
          const hargaResult = await client.query(
            'SELECT harga_jual FROM master_produk WHERE id_produk = $1',
            [id_produk]
          )
          const harga_satuan = hargaResult.rows[0]?.harga_jual || 0
          const diskon = Math.random() > 0.7 ? Math.floor(harga_satuan * 0.1) : 0
          const total_tagihan = (harga_satuan * qty) - diskon

          await client.query(
            `INSERT INTO transaksi_penjualan 
             (tanggal, no_invoice, id_klien, id_produk, nama_produk, jenis_item, qty, harga_satuan, diskon, total_tagihan)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              formatDate(invoice.tanggal),
              invoice.no_invoice,
              invoice.id_klien,
              id_produk,
              nama_produk,
              kategori,
              qty,
              harga_satuan,
              diskon,
              total_tagihan
            ]
          )
        }
      }

      // 6. Log Tugas (2 bulan terakhir)
      console.log('📝 Inserting log_tugas...')
      const karyawanIds = ['KRY001', 'KRY002', 'KRY003', 'KRY004', 'KRY005']
      const tugasIds = ['TSK001', 'TSK002', 'TSK003', 'TSK004', 'TSK005', 'TSK006', 'TSK007']
      const statuses: ('Pending' | 'Approved')[] = ['Pending', 'Approved']

      for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
        const date = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
        const periode = formatPeriode(date)
        
        // Generate 20-30 log tugas per bulan
        const logCount = Math.floor(Math.random() * 11) + 20
        for (let i = 0; i < logCount; i++) {
          const id_karyawan = karyawanIds[Math.floor(Math.random() * karyawanIds.length)]
          const id_tugas = tugasIds[Math.floor(Math.random() * tugasIds.length)]
          const jumlah_tugas = Math.floor(Math.random() * 5) + 1
          
          // Get bonus per unit
          const bonusResult = await client.query(
            'SELECT bonus_per_unit FROM master_tugas WHERE id_tugas = $1',
            [id_tugas]
          )
          const bonus_per_unit = bonusResult.rows[0]?.bonus_per_unit || 0
          const bonus_terhitung = bonus_per_unit * jumlah_tugas
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          
          const logDate = new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1)

          await client.query(
            `INSERT INTO log_tugas 
             (tanggal, periode, id_karyawan, id_tugas, jumlah_tugas, bonus_terhitung, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              formatDate(logDate),
              periode,
              id_karyawan,
              id_tugas,
              jumlah_tugas,
              bonus_terhitung,
              status
            ]
          )
        }
      }

      // 7. Penggajian (2 bulan terakhir)
      console.log('💵 Inserting penggajian...')
      for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
        const date = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
        const periode = formatPeriode(date)
        
        for (const karyawan of karyawanData) {
          // Get total bonus dari log_tugas yang approved
          const bonusResult = await client.query(
            `SELECT COALESCE(SUM(bonus_terhitung), 0) as total_bonus
             FROM log_tugas 
             WHERE periode = $1 AND id_karyawan = $2 AND status = 'Approved'`,
            [periode, karyawan.id_karyawan]
          )
          const total_bonus = parseFloat(bonusResult.rows[0]?.total_bonus || '0')
          const total_gaji = karyawan.gaji_pokok + total_bonus
          const status = monthOffset === 0 ? 'Draft' : 'Final'

          await client.query(
            `INSERT INTO penggajian 
             (periode, id_karyawan, gaji_pokok, total_bonus, total_gaji, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (periode, id_karyawan) DO NOTHING`,
            [periode, karyawan.id_karyawan, karyawan.gaji_pokok, total_bonus, total_gaji, status]
          )
        }
      }

      // 8. Biaya Operasional (3 bulan terakhir)
      console.log('💸 Inserting biaya_operasional...')
      const biayaKategori = ['Bahan Baku', 'Transport', 'Perawatan', 'Lain-lain']
      const biayaDeskripsi = [
        'Pembelian kertas foto', 'Bensin kendaraan', 'Service kamera', 'Pembelian flash disk',
        'Service printer', 'Pembelian tinta', 'Parkir', 'Makan siang tim',
        'Pembelian props', 'Sewa lokasi', 'Pembelian baterai', 'Internet bulanan'
      ]

      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const date = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
        // Generate 5-10 biaya per bulan
        const biayaCount = Math.floor(Math.random() * 6) + 5
        for (let i = 0; i < biayaCount; i++) {
          const biayaDate = new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1)
          const deskripsi = biayaDeskripsi[Math.floor(Math.random() * biayaDeskripsi.length)]
          const kategori = biayaKategori[Math.floor(Math.random() * biayaKategori.length)]
          const jumlah = Math.floor(Math.random() * 500000) + 50000
          const ref_invoice = Math.random() > 0.5 ? `INV-2024-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}` : null

          await client.query(
            `INSERT INTO biaya_operasional 
             (tanggal, deskripsi, jumlah, ref_invoice, kategori)
             VALUES ($1, $2, $3, $4, $5)`,
            [formatDate(biayaDate), deskripsi, jumlah, ref_invoice, kategori]
          )
        }
      }

      // 9. Fix Cost
      console.log('🏢 Inserting fix_cost...')
      const fixCostData = [
        { nama_biaya: 'Sewa Studio', jumlah: 5000000 },
        { nama_biaya: 'Listrik', jumlah: 1500000 },
        { nama_biaya: 'Internet', jumlah: 500000 },
        { nama_biaya: 'Air', jumlah: 300000 },
        { nama_biaya: 'Asuransi', jumlah: 1000000 },
        { nama_biaya: 'Pajak', jumlah: 2000000 },
      ]

      for (const fixCost of fixCostData) {
        await client.query(
          `INSERT INTO fix_cost (nama_biaya, jumlah, aktif)
           VALUES ($1, $2, true)
           ON CONFLICT DO NOTHING`,
          [fixCost.nama_biaya, fixCost.jumlah]
        )
      }

      console.log('✅ Dummy data berhasil di-insert!')
    })
  } catch (error) {
    console.error('❌ Error seeding dummy data:', error)
    throw error
  }
}

// Jika dijalankan langsung
const isMainModule = process.argv[1] && process.argv[1].endsWith('seed-dummy-data.ts')

if (isMainModule) {
  seedDummyData()
    .then(async () => {
      console.log('🎉 Seeding selesai!')
      await closePool()
      process.exit(0)
    })
    .catch(async (error) => {
      console.error('💥 Seeding gagal:', error)
      await closePool()
      process.exit(1)
    })
}

