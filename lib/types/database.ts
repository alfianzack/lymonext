export type UserRole = 'admin' | 'owner'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface MasterProduk {
  id: string
  id_produk: string
  nama_produk: string
  kategori: 'Paket' | 'Tambahan'
  harga_jual: number
  satuan: 'Paket' | 'Orang' | 'File' | 'Cetak'
  aktif: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseKlien {
  id: string
  id_klien: string
  nama_klien: string
  email?: string
  telepon?: string
  alamat?: string
  created_at: string
  updated_at: string
}

export interface TransaksiPenjualan {
  id: string
  tanggal: string
  no_invoice: string
  id_klien: string
  id_produk: string
  nama_produk: string
  jenis_item: 'Paket' | 'Tambahan'
  qty: number
  harga_satuan: number
  total_tagihan: number
  diskon?: number
  created_at: string
  updated_at: string
}

export interface MasterTugas {
  id: string
  id_tugas: string
  nama_tugas: string
  bonus_per_unit: number
  aktif: boolean
  created_at: string
  updated_at: string
}

export interface MasterKaryawan {
  id: string
  id_karyawan: string
  nama_karyawan: string
  gaji_pokok: number
  aktif: boolean
  created_at: string
  updated_at: string
}

export interface LogTugas {
  id: string
  tanggal: string
  periode: string
  id_karyawan: string
  id_tugas: string
  jumlah_tugas: number
  bonus_terhitung: number
  status: 'Pending' | 'Approved'
  created_at: string
  updated_at: string
}

export interface Penggajian {
  id: string
  periode: string
  id_karyawan: string
  gaji_pokok: number
  total_bonus: number
  total_gaji: number
  status: 'Draft' | 'Final'
  created_at: string
  updated_at: string
}

export interface BiayaOperasional {
  id: string
  tanggal: string
  deskripsi: string
  jumlah: number
  ref_invoice?: string
  kategori: string
  created_at: string
  updated_at: string
}

export interface FixCost {
  id: string
  nama_biaya: string
  jumlah: number
  aktif: boolean
  created_at: string
  updated_at: string
}

export interface ProfitInvoice {
  id: string
  no_invoice: string
  total_pendapatan: number
  total_biaya: number
  profit: number
  periode: string
  created_at: string
  updated_at: string
}

