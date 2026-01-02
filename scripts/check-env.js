/**
 * Script untuk mengecek apakah environment variables sudah di-set
 */

require('dotenv').config({ path: '.env.local' })

const requiredVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'JWT_SECRET'
]

console.log('🔍 Checking environment variables...\n')

let allSet = true

requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    // Mask sensitive values
    const displayValue = varName === 'DATABASE_URL' || varName === 'JWT_SECRET'
      ? value.substring(0, 20) + '...'
      : value
    console.log(`✅ ${varName}: ${displayValue}`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
    allSet = false
  }
})

console.log('')

if (!allSet) {
  console.log('⚠️  Beberapa environment variables belum di-set!')
  console.log('📝 Buat file .env.local di root project dengan isi:')
  console.log('')
  console.log('DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.log('JWT_SECRET=your-secret-key-change-in-production')
  console.log('')
  process.exit(1)
} else {
  console.log('✅ Semua environment variables sudah di-set!')
  process.exit(0)
}

