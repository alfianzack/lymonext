import { Pool, Client } from 'pg'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local (jika belum ter-load)
if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), '.env.local') })
}

// Connection string dari environment variable
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. Pastikan file .env.local ada dan berisi DATABASE_URL')
}

// Deteksi apakah menggunakan Supabase (perlu SSL) atau local PostgreSQL
const isSupabase = connectionString.includes('supabase.com') || connectionString.includes('pooler.supabase.com')
const sslConfig = isSupabase 
  ? { rejectUnauthorized: false } // Supabase menggunakan SSL
  : false // Local PostgreSQL biasanya tidak menggunakan SSL

// Pool connection untuk penggunaan yang lebih efisien (recommended untuk production)
export const pool = new Pool({
  connectionString,
  // Konfigurasi tambahan untuk Supabase connection pooling
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: sslConfig
})

// Client connection untuk single query (optional)
export function createClient() {
  return new Client({
    connectionString,
    ssl: sslConfig
  })
}

// Helper function untuk query menggunakan pool
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error', { text, error })
    throw error
  }
}

// Helper function untuk transaction
export async function transaction<T>(
  callback: (client: Client) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client as any)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Cleanup function untuk graceful shutdown
export async function closePool() {
  await pool.end()
}

