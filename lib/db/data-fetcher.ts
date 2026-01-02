/**
 * Data Fetcher - Switch antara Supabase REST API dan PostgreSQL direct connection
 * Berdasarkan environment variable DATABASE_MODE
 */

import { query } from './postgres'
import { DATABASE_MODE, isLocalDatabase } from './config'

/**
 * Fetch data dari master_produk
 */
export async function fetchMasterProduk(options?: {
  order?: string
  dir?: 'asc' | 'desc'
  aktif?: boolean
}) {
  if (isLocalDatabase()) {
    // Menggunakan PostgreSQL direct connection
    return fetchMasterProdukLocal(options)
  } else {
    // Menggunakan Supabase REST API
    return fetchMasterProdukSupabase(options)
  }
}

/**
 * Fetch dari PostgreSQL lokal
 */
async function fetchMasterProdukLocal(options?: {
  order?: string
  dir?: 'asc' | 'desc'
  aktif?: boolean
}) {
  let sql = 'SELECT * FROM master_produk'
  const params: any[] = []
  
  // Filter aktif jika ada
  if (options?.aktif !== undefined) {
    sql += ' WHERE aktif = $1'
    params.push(options.aktif)
  }
  
  // Order by
  const orderBy = options?.order || 'id_produk'
  const orderDir = (options?.dir || 'asc').toUpperCase()
  sql += ` ORDER BY ${orderBy} ${orderDir}`

  const result = await query(sql, params.length > 0 ? params : undefined)
  return result.rows
}

/**
 * Fetch dari Supabase REST API
 */
async function fetchMasterProdukSupabase(options?: {
  order?: string
  dir?: 'asc' | 'desc'
  aktif?: boolean
}) {
  // Import server client untuk server-side
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  
  let query = supabase
    .from('master_produk')
    .select('*')
  
  // Filter aktif jika ada
  if (options?.aktif !== undefined) {
    query = query.eq('aktif', options.aktif)
  }
  
  // Order by
  const orderBy = options?.order || 'id_produk'
  const orderDir = options?.dir === 'desc' ? false : true
  query = query.order(orderBy, { ascending: orderDir })

  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

/**
 * Insert data ke master_produk
 */
export async function insertMasterProduk(data: {
  id_produk: string
  nama_produk: string
  kategori: 'Paket' | 'Tambahan'
  harga_jual: number
  satuan: 'Paket' | 'Orang' | 'File' | 'Cetak'
  aktif?: boolean
}) {
  if (isLocalDatabase()) {
    return insertMasterProdukLocal(data)
  } else {
    return insertMasterProdukSupabase(data)
  }
}

async function insertMasterProdukLocal(data: {
  id_produk: string
  nama_produk: string
  kategori: 'Paket' | 'Tambahan'
  harga_jual: number
  satuan: 'Paket' | 'Orang' | 'File' | 'Cetak'
  aktif?: boolean
}) {
  const result = await query(
    `INSERT INTO master_produk (id_produk, nama_produk, kategori, harga_jual, satuan, aktif)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.id_produk, data.nama_produk, data.kategori, data.harga_jual, data.satuan, data.aktif ?? true]
  )
  return result.rows[0]
}

async function insertMasterProdukSupabase(data: {
  id_produk: string
  nama_produk: string
  kategori: 'Paket' | 'Tambahan'
  harga_jual: number
  satuan: 'Paket' | 'Orang' | 'File' | 'Cetak'
  aktif?: boolean
}) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: result, error } = await supabase
    .from('master_produk')
    .insert([data])
    .select()
    .single()
  
  if (error) throw error
  return result
}

/**
 * Update data master_produk
 */
export async function updateMasterProduk(id: string, data: Partial<{
  id_produk: string
  nama_produk: string
  kategori: 'Paket' | 'Tambahan'
  harga_jual: number
  satuan: 'Paket' | 'Orang' | 'File' | 'Cetak'
  aktif: boolean
}>) {
  if (isLocalDatabase()) {
    return updateMasterProdukLocal(id, data)
  } else {
    return updateMasterProdukSupabase(id, data)
  }
}

async function updateMasterProdukLocal(id: string, data: any) {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramIndex}`)
      values.push(data[key])
      paramIndex++
    }
  })

  if (fields.length === 0) {
    throw new Error('Tidak ada field yang diupdate')
  }

  fields.push(`updated_at = NOW()`)
  values.push(id)

  const sql = `UPDATE master_produk SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`
  const result = await query(sql, values)
  
  if (result.rows.length === 0) {
    throw new Error('Produk tidak ditemukan')
  }
  
  return result.rows[0]
}

async function updateMasterProdukSupabase(id: string, data: any) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: result, error } = await supabase
    .from('master_produk')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return result
}

/**
 * Delete data master_produk
 */
export async function deleteMasterProduk(id: string) {
  if (isLocalDatabase()) {
    return deleteMasterProdukLocal(id)
  } else {
    return deleteMasterProdukSupabase(id)
  }
}

async function deleteMasterProdukLocal(id: string) {
  const result = await query(
    'DELETE FROM master_produk WHERE id = $1 RETURNING *',
    [id]
  )
  
  if (result.rows.length === 0) {
    throw new Error('Produk tidak ditemukan')
  }
  
  return result.rows[0]
}

async function deleteMasterProdukSupabase(id: string) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { error } = await supabase
    .from('master_produk')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

