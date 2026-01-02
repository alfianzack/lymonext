'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import type { LogTugas, MasterTugas, MasterKaryawan } from '@/lib/types/database'

interface LogTugasClientProps {
  userRole: 'admin' | 'owner'
}

export default function LogTugasClient({ userRole }: LogTugasClientProps) {
  const [logTugas, setLogTugas] = useState<LogTugas[]>([])
  const [tugas, setTugas] = useState<MasterTugas[]>([])
  const [karyawan, setKaryawan] = useState<MasterKaryawan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    periode: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
    id_karyawan: '',
    id_tugas: '',
    jumlah_tugas: 1,
  })
  const [selectedTugas, setSelectedTugas] = useState<MasterTugas | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.id_tugas) {
      const tugasData = tugas.find(t => t.id_tugas === formData.id_tugas)
      setSelectedTugas(tugasData || null)
    } else {
      setSelectedTugas(null)
    }
  }, [formData.id_tugas, tugas])

  const loadData = async () => {
    try {
      const [logRes, tugasRes, karyawanRes] = await Promise.all([
        supabase.from('log_tugas').select('*').order('tanggal', { ascending: false }),
        supabase.from('master_tugas').select('*').eq('aktif', true).order('id_tugas'),
        supabase.from('master_karyawan').select('*').eq('aktif', true).order('id_karyawan'),
      ])

      if (logRes.error) throw logRes.error
      if (tugasRes.error) throw tugasRes.error
      if (karyawanRes.error) throw karyawanRes.error

      setLogTugas(logRes.data || [])
      setTugas(tugasRes.data || [])
      setKaryawan(karyawanRes.data || [])
    } catch (error: any) {
      console.error('Error loading data:', error)
      alert('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const calculateBonus = () => {
    if (!selectedTugas) return 0
    return selectedTugas.bonus_per_unit * formData.jumlah_tugas
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTugas) {
      alert('Pilih tugas terlebih dahulu')
      return
    }

    try {
      const bonusTerhitung = calculateBonus()
      const dataToSave = {
        tanggal: formData.tanggal,
        periode: formData.periode,
        id_karyawan: formData.id_karyawan,
        id_tugas: formData.id_tugas,
        jumlah_tugas: formData.jumlah_tugas,
        bonus_terhitung: bonusTerhitung,
        status: 'Pending' as const,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('log_tugas')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('log_tugas')
          .insert([{
            ...dataToSave,
            created_at: new Date().toISOString(),
          }])

        if (error) throw error
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        periode: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        id_karyawan: '',
        id_tugas: '',
        jumlah_tugas: 1,
      })
      setSelectedTugas(null)
      loadData()
    } catch (error: any) {
      console.error('Error saving log tugas:', error)
      alert('Gagal menyimpan log tugas')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('log_tugas')
        .update({ status: 'Approved', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error: any) {
      console.error('Error approving log tugas:', error)
      alert('Gagal approve log tugas')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('log_tugas')
        .update({ status: 'Pending', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error: any) {
      console.error('Error rejecting log tugas:', error)
      alert('Gagal reject log tugas')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus log tugas ini?')) return

    try {
      const { error } = await supabase
        .from('log_tugas')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error: any) {
      console.error('Error deleting log tugas:', error)
      alert('Gagal menghapus log tugas')
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log Tugas & Bonus</h1>
          <p className="text-gray-600 mt-2">Mencatat pekerjaan nyata yang selesai</p>
        </div>
        {userRole === 'admin' && (
          <Button onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({
              tanggal: new Date().toISOString().split('T')[0],
              periode: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
              id_karyawan: '',
              id_tugas: '',
              jumlah_tugas: 1,
            })
            setSelectedTugas(null)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Log Tugas
          </Button>
        )}
      </div>

      {showForm && userRole === 'admin' && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Log Tugas' : 'Tambah Log Tugas Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periode
                </label>
                <input
                  type="text"
                  value={formData.periode}
                  onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Jan-2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Karyawan
                </label>
                <select
                  value={formData.id_karyawan}
                  onChange={(e) => setFormData({ ...formData, id_karyawan: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Pilih Karyawan</option>
                  {karyawan.map((k) => (
                    <option key={k.id} value={k.id_karyawan}>
                      {k.id_karyawan} - {k.nama_karyawan}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tugas
                </label>
                <select
                  value={formData.id_tugas}
                  onChange={(e) => setFormData({ ...formData, id_tugas: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Pilih Tugas</option>
                  {tugas.map((t) => (
                    <option key={t.id} value={t.id_tugas}>
                      {t.id_tugas} - {t.nama_tugas} ({formatCurrency(t.bonus_per_unit)}/unit)
                    </option>
                  ))}
                </select>
              </div>
              {selectedTugas && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Tugas
                    </label>
                    <input
                      type="number"
                      value={formData.jumlah_tugas}
                      onChange={(e) => setFormData({ ...formData, jumlah_tugas: Number(e.target.value) })}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm text-gray-600">Bonus per Unit: <span className="font-semibold">{formatCurrency(selectedTugas.bonus_per_unit)}</span></p>
                    <p className="text-lg font-semibold text-primary-900 mt-2">
                      Bonus Terhitung: {formatCurrency(calculateBonus())}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!selectedTugas}>Simpan</Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setSelectedTugas(null)
              }}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Periode</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Karyawan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tugas</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jumlah</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bonus</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                {userRole === 'owner' && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {logTugas.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{formatDate(item.tanggal)}</td>
                  <td className="py-3 px-4 text-sm">{item.periode}</td>
                  <td className="py-3 px-4 text-sm">{item.id_karyawan}</td>
                  <td className="py-3 px-4 text-sm">{item.id_tugas}</td>
                  <td className="py-3 px-4 text-sm">{item.jumlah_tugas}</td>
                  <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(item.bonus_terhitung)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  {userRole === 'owner' && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {item.status === 'Pending' && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'Approved' && (
                          <button
                            onClick={() => handleReject(item.id)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

