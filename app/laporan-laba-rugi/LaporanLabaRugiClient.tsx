'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

export default function LaporanLabaRugiClient() {
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  )
  const [laporan, setLaporan] = useState({
    pendapatan: 0,
    fixCost: 0,
    biayaOperasional: 0,
    gajiBonus: 0,
    labaBersih: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadLaporan()
  }, [selectedPeriod])

  const loadLaporan = async () => {
    try {
      setLoading(true)
      const currentDate = new Date()
      const periodParts = selectedPeriod.split('-')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      const monthIndex = monthNames.indexOf(periodParts[0])
      const year = parseInt(periodParts[1])
      
      if (monthIndex === -1) {
        alert('Format periode tidak valid. Gunakan format: Jan-2025')
        return
      }

      const startDate = new Date(year, monthIndex, 1)
      const endDate = new Date(year, monthIndex + 1, 0)

      // Get pendapatan
      const { data: transaksi } = await supabase
        .from('transaksi_penjualan')
        .select('total_tagihan')
        .gte('tanggal', startDate.toISOString().split('T')[0])
        .lte('tanggal', endDate.toISOString().split('T')[0])

      const pendapatan = transaksi?.reduce((sum, t) => sum + (t.total_tagihan || 0), 0) || 0

      // Get fix cost
      const { data: fixCosts } = await supabase
        .from('fix_cost')
        .select('jumlah')
        .eq('aktif', true)

      const fixCost = fixCosts?.reduce((sum, f) => sum + (f.jumlah || 0), 0) || 0

      // Get biaya operasional
      const { data: biayaOps } = await supabase
        .from('biaya_operasional')
        .select('jumlah')
        .gte('tanggal', startDate.toISOString().split('T')[0])
        .lte('tanggal', endDate.toISOString().split('T')[0])

      const biayaOperasional = biayaOps?.reduce((sum, b) => sum + (b.jumlah || 0), 0) || 0

      // Get gaji + bonus
      const { data: penggajian } = await supabase
        .from('penggajian')
        .select('total_gaji')
        .eq('periode', selectedPeriod)

      const gajiBonus = penggajian?.reduce((sum, p) => sum + (p.total_gaji || 0), 0) || 0

      const labaBersih = pendapatan - fixCost - biayaOperasional - gajiBonus

      setLaporan({
        pendapatan,
        fixCost,
        biayaOperasional,
        gajiBonus,
        labaBersih,
      })
    } catch (error: any) {
      console.error('Error loading laporan:', error)
      alert('Gagal memuat laporan laba rugi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Laba Rugi</h1>
          <p className="text-gray-600 mt-2">Laporan keuangan otomatis & real-time</p>
        </div>
        <input
          type="text"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          placeholder="Jan-2025"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-6">Laporan Laba Rugi Periode: {selectedPeriod}</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <span className="text-lg font-semibold text-gray-700">Pendapatan</span>
            <span className="text-lg font-bold text-green-600">{formatCurrency(laporan.pendapatan)}</span>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Biaya:</h3>
            <div className="space-y-2 ml-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fix Cost</span>
                <span className="font-semibold text-red-600">- {formatCurrency(laporan.fixCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Biaya Operasional</span>
                <span className="font-semibold text-red-600">- {formatCurrency(laporan.biayaOperasional)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gaji + Bonus</span>
                <span className="font-semibold text-red-600">- {formatCurrency(laporan.gajiBonus)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-xl font-semibold text-gray-700">Laba Bersih</span>
              <span className={`text-2xl font-bold ${
                laporan.labaBersih >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(laporan.labaBersih)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

