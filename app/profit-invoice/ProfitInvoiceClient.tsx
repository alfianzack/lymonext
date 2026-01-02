'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { ProfitInvoice, TransaksiPenjualan, BiayaOperasional } from '@/lib/types/database'

export default function ProfitInvoiceClient() {
  const [profitData, setProfitData] = useState<ProfitInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadProfitData()
  }, [])

  const loadProfitData = async () => {
    try {
      // Get all invoices
      const { data: invoices, error: invError } = await supabase
        .from('transaksi_penjualan')
        .select('no_invoice, total_tagihan, tanggal')

      if (invError) throw invError

      // Group by invoice
      const invoiceMap = new Map<string, { total: number; tanggal: string }>()
      invoices?.forEach((inv) => {
        const current = invoiceMap.get(inv.no_invoice) || { total: 0, tanggal: inv.tanggal }
        invoiceMap.set(inv.no_invoice, {
          total: current.total + inv.total_tagihan,
          tanggal: current.tanggal,
        })
      })

      // Get operational costs by invoice
      const { data: biayaOps, error: biayaError } = await supabase
        .from('biaya_operasional')
        .select('ref_invoice, jumlah')

      if (biayaError) throw biayaError

      const biayaMap = new Map<string, number>()
      biayaOps?.forEach((biaya) => {
        if (biaya.ref_invoice) {
          const current = biayaMap.get(biaya.ref_invoice) || 0
          biayaMap.set(biaya.ref_invoice, current + biaya.jumlah)
        }
      })

      // Calculate profit per invoice
      const profitList: ProfitInvoice[] = Array.from(invoiceMap.entries()).map(([noInvoice, data]) => {
        const totalBiaya = biayaMap.get(noInvoice) || 0
        const profit = data.total - totalBiaya
        const periode = new Date(data.tanggal).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })

        return {
          id: noInvoice,
          no_invoice: noInvoice,
          total_pendapatan: data.total,
          total_biaya: totalBiaya,
          profit,
          periode,
          created_at: data.tanggal,
          updated_at: data.tanggal,
        }
      })

      // Sort by profit descending
      profitList.sort((a, b) => b.profit - a.profit)
      setProfitData(profitList)
    } catch (error: any) {
      console.error('Error loading profit data:', error)
      alert('Gagal memuat data profit invoice')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profit per Invoice</h1>
        <p className="text-gray-600 mt-2">Analisa keuntungan tiap invoice</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No Invoice</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Periode</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Pendapatan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Biaya</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
              </tr>
            </thead>
            <tbody>
              {profitData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium">{item.no_invoice}</td>
                  <td className="py-3 px-4 text-sm">{item.periode}</td>
                  <td className="py-3 px-4 text-sm">{formatCurrency(item.total_pendapatan)}</td>
                  <td className="py-3 px-4 text-sm">{formatCurrency(item.total_biaya)}</td>
                  <td className={`py-3 px-4 text-sm font-semibold ${
                    item.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(item.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

