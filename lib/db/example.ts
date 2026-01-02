/**
 * Contoh penggunaan koneksi PostgreSQL langsung
 * 
 * File ini berisi contoh-contoh cara menggunakan koneksi PostgreSQL
 * menggunakan connection string Supabase.
 */

import { query, transaction, pool } from './postgres'

// Contoh 1: Query sederhana
export async function contohQuerySederhana() {
  try {
    const result = await query('SELECT * FROM users LIMIT 10')
    return result.rows
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Contoh 2: Query dengan parameter (prevent SQL injection)
export async function contohQueryDenganParameter(userId: string) {
  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    )
    return result.rows[0]
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Contoh 3: Insert data
export async function contohInsert(nama: string, email: string) {
  try {
    const result = await query(
      'INSERT INTO users (nama, email) VALUES ($1, $2) RETURNING *',
      [nama, email]
    )
    return result.rows[0]
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Contoh 4: Transaction (multiple queries dalam satu transaksi)
export async function contohTransaction() {
  try {
    return await transaction(async (client) => {
      // Query 1
      const userResult = await client.query(
        'INSERT INTO users (nama, email) VALUES ($1, $2) RETURNING id',
        ['John Doe', 'john@example.com']
      )
      const userId = userResult.rows[0].id

      // Query 2 (menggunakan hasil query 1)
      const profileResult = await client.query(
        'INSERT INTO profiles (user_id, bio) VALUES ($1, $2) RETURNING *',
        [userId, 'Bio user baru']
      )

      return {
        user: userResult.rows[0],
        profile: profileResult.rows[0]
      }
    })
  } catch (error) {
    console.error('Transaction error:', error)
    throw error
  }
}

// Contoh 5: Menggunakan pool langsung
export async function contohPoolLangsung() {
  try {
    const result = await pool.query('SELECT NOW() as current_time')
    return result.rows[0]
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

