/**
 * Script untuk menjalankan seeding dummy data
 * 
 * Cara menggunakan:
 * 1. Pastikan DATABASE_URL sudah di-set di .env.local
 * 2. Jalankan: node scripts/seed-dummy-data.js
 * 
 * Atau dengan tsx:
 * npx tsx lib/db/seed-dummy-data.ts
 */

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL tidak ditemukan di .env.local')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

// Import dan jalankan seeding
async function runSeed() {
  try {
    // Dynamic import untuk TypeScript file
    const { seedDummyData } = await import('../lib/db/seed-dummy-data.ts')
    await seedDummyData()
    console.log('🎉 Seeding selesai!')
    process.exit(0)
  } catch (error) {
    console.error('💥 Error:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runSeed()

