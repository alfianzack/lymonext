import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calculator,
  Briefcase
} from 'lucide-react'

export default async function DashboardPage() {
  const { user, redirect: redirectTo } = await requireAuth('owner')
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const period = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  // Get omzet bulan ini
  const { data: transaksi } = await supabase
    .from('transaksi_penjualan')
    .select('total_tagihan')
    .gte('tanggal', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
    .lt('tanggal', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)

  const totalOmzet = transaksi?.reduce((sum, t) => sum + (t.total_tagihan || 0), 0) || 0

  // Get biaya operasional
  const { data: biayaOps } = await supabase
    .from('biaya_operasional')
    .select('jumlah')
    .gte('tanggal', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
    .lt('tanggal', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)

  const totalBiayaOps = biayaOps?.reduce((sum, b) => sum + (b.jumlah || 0), 0) || 0

  // Get fix cost
  const { data: fixCosts } = await supabase
    .from('fix_cost')
    .select('jumlah')
    .eq('aktif', true)

  const totalFixCost = fixCosts?.reduce((sum, f) => sum + (f.jumlah || 0), 0) || 0

  // Get gaji + bonus
  const { data: penggajian } = await supabase
    .from('penggajian')
    .select('total_gaji')
    .eq('periode', period)

  const totalGaji = penggajian?.reduce((sum, p) => sum + (p.total_gaji || 0), 0) || 0

  const totalBiaya = totalBiayaOps + totalFixCost + totalGaji
  const labaBersih = totalOmzet - totalBiaya

  // Get jumlah klien bulan ini
  const { data: klienData } = await supabase
    .from('transaksi_penjualan')
    .select('id_klien')
    .gte('tanggal', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
    .lt('tanggal', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)

  const uniqueKlien = new Set(klienData?.map(k => k.id_klien) || [])
  const jumlahKlien = uniqueKlien.size
  const rataOmzetPerKlien = jumlahKlien > 0 ? totalOmzet / jumlahKlien : 0

  const stats = [
    {
      title: 'Total Omzet Bulan Ini',
      value: formatCurrency(totalOmzet),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Laba Bersih Bulan Ini',
      value: formatCurrency(labaBersih),
      icon: TrendingUp,
      color: labaBersih >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: labaBersih >= 0 ? 'bg-blue-50' : 'bg-red-50',
    },
    {
      title: 'Jumlah Klien',
      value: jumlahKlien.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Rata-rata Omzet / Klien',
      value: formatCurrency(rataOmzetPerKlien),
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Gaji + Bonus',
      value: formatCurrency(totalGaji),
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Ringkasan keuangan bulan ini</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Omzet vs Laba (Bulanan)">
            <p className="text-gray-500 text-sm">Grafik akan ditampilkan di sini</p>
            <p className="text-xs text-gray-400 mt-2">*Integrasi dengan recharts akan ditambahkan</p>
          </Card>

          <Card title="Komposisi Biaya">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fix Cost:</span>
                <span className="font-semibold">{formatCurrency(totalFixCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gaji + Bonus:</span>
                <span className="font-semibold">{formatCurrency(totalGaji)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Biaya Variabel:</span>
                <span className="font-semibold">{formatCurrency(totalBiayaOps)}</span>
              </div>
            </div>
          </Card>

          <Card title="Top 5 Invoice Paling Untung">
            <p className="text-gray-500 text-sm">Daftar akan ditampilkan di sini</p>
            <p className="text-xs text-gray-400 mt-2">*Data dari profit_invoice</p>
          </Card>

          <Card title="Tambahan Paling Laku">
            <p className="text-gray-500 text-sm">Daftar akan ditampilkan di sini</p>
            <p className="text-xs text-gray-400 mt-2">*Analisis dari transaksi_penjualan</p>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

