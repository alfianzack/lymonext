'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, RefreshCw } from 'lucide-react'
import type { Penggajian, MasterKaryawan, LogTugas } from '@/lib/types/database'

export default function PenggajianClient() {
  const [penggajian, setPenggajian] = useState<Penggajian[]>([])
  const [karyawan, setKaryawan] = useState<MasterKaryawan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  )
  const supabase = createClient()

  const loadData = useCallback(async () => {
    try {
      const [penggajianRes, karyawanRes] = await Promise.all([
        supabase.from('penggajian').select('*').order('periode', { ascending: false }),
        supabase.from('master_karyawan').select('*').eq('aktif', true).order('id_karyawan'),
      ])

      if (penggajianRes.error) throw penggajianRes.error
      if (karyawanRes.error) throw karyawanRes.error

      setPenggajian(penggajianRes.data || [])
      setKaryawan(karyawanRes.data || [])
    } catch (error: any) {
      console.error('Error loading data:', error)
      alert('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const generatePayroll = async () => {
    if (!confirm(`Generate payroll untuk periode ${selectedPeriod}?`)) return

    try {
      // Get all approved log tugas for the period
      const { data: logTugas, error: logError } = await supabase
        .from('log_tugas')
        .select('*')
        .eq('periode', selectedPeriod)
        .eq('status', 'Approved')

      if (logError) throw logError

      // Calculate bonus per employee
      const bonusMap = new Map<string, number>()
      logTugas?.forEach((log) => {
        const current = bonusMap.get(log.id_karyawan) || 0
        bonusMap.set(log.id_karyawan, current + log.bonus_terhitung)
      })

      // Get all active employees
      const { data: employees, error: empError } = await supabase
        .from('master_karyawan')
        .select('*')
        .eq('aktif', true)

      if (empError) throw empError

      // Generate payroll for each employee
      const payrollData = employees?.map((emp) => {
        const totalBonus = bonusMap.get(emp.id_karyawan) || 0
        return {
          periode: selectedPeriod,
          id_karyawan: emp.id_karyawan,
          gaji_pokok: emp.gaji_pokok,
          total_bonus: totalBonus,
          total_gaji: emp.gaji_pokok + totalBonus,
          status: 'Draft' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }) || []

      // Delete existing payroll for the period
      await supabase
        .from('penggajian')
        .delete()
        .eq('periode', selectedPeriod)

      // Insert new payroll
      const { error: insertError } = await supabase
        .from('penggajian')
        .insert(payrollData)

      if (insertError) throw insertError

      alert('Payroll berhasil di-generate!')
      loadData()
    } catch (error: any) {
      console.error('Error generating payroll:', error)
      alert('Gagal generate payroll')
    }
  }

  const finalizePayroll = async (id: string) => {
    if (!confirm('Finalkan payroll ini? Status akan diubah menjadi Final.')) return

    try {
      const { error } = await supabase
        .from('penggajian')
        .update({ status: 'Final', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error: any) {
      console.error('Error finalizing payroll:', error)
      alert('Gagal finalkan payroll')
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  const currentPeriodPayroll = penggajian.filter(p => p.periode === selectedPeriod)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penggajian Bulanan</h1>
          <p className="text-gray-600 mt-2">Rekap gaji tetap + bonus bulanan</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            placeholder="Jan-2025"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <Button onClick={generatePayroll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Payroll
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Payroll Periode: {selectedPeriod}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Karyawan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Gaji Pokok</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Bonus</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Gaji</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentPeriodPayroll.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Belum ada data payroll untuk periode ini. Klik &quot;Generate Payroll&quot; untuk membuat.
                  </td>
                </tr>
              ) : (
                currentPeriodPayroll.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{item.id_karyawan}</td>
                    <td className="py-3 px-4 text-sm">{formatCurrency(item.gaji_pokok)}</td>
                    <td className="py-3 px-4 text-sm">{formatCurrency(item.total_bonus)}</td>
                    <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(item.total_gaji)}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'Final' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.status === 'Draft' && (
                        <Button
                          size="sm"
                          onClick={() => finalizePayroll(item.id)}
                        >
                          Finalkan
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

