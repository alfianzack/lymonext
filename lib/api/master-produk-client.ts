/**
 * Client API untuk Master Produk
 * Menggunakan API routes yang otomatis switch berdasarkan DATABASE_MODE
 */

import type { MasterProduk } from '@/lib/types/database'

const API_BASE = '/api/master-produk'

export async function getMasterProduk(options?: {
  order?: string
  dir?: 'asc' | 'desc'
  aktif?: boolean
}): Promise<MasterProduk[]> {
  const params = new URLSearchParams()
  if (options?.order) params.append('order', options.order)
  if (options?.dir) params.append('dir', options.dir)
  if (options?.aktif !== undefined) params.append('aktif', String(options.aktif))

  const url = `${API_BASE}${params.toString() ? '?' + params.toString() : ''}`
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Gagal mengambil data produk')
  }

  const result = await response.json()
  return result.data
}

export async function createMasterProduk(data: Omit<MasterProduk, 'id' | 'created_at' | 'updated_at'>): Promise<MasterProduk> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Gagal membuat produk')
  }

  const result = await response.json()
  return result.data
}

export async function updateMasterProduk(id: string, data: Partial<Omit<MasterProduk, 'id' | 'created_at' | 'updated_at'>>): Promise<MasterProduk> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Gagal mengupdate produk')
  }

  const result = await response.json()
  return result.data
}

export async function deleteMasterProduk(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Gagal menghapus produk')
  }
}

