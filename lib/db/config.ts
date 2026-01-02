/**
 * Konfigurasi Database
 * Menentukan apakah menggunakan Supabase REST API atau PostgreSQL direct connection
 */

// Mode database: 'supabase' untuk REST API, 'local' untuk PostgreSQL direct
export const DATABASE_MODE = (process.env.DATABASE_MODE || 'supabase') as 'supabase' | 'local'

// Helper untuk cek apakah menggunakan local database
export const isLocalDatabase = () => DATABASE_MODE === 'local'

// Helper untuk cek apakah menggunakan Supabase REST API
export const isSupabaseDatabase = () => DATABASE_MODE === 'supabase'

