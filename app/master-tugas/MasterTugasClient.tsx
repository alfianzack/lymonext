'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { MasterTugas } from '@/lib/types/database'

export default function MasterTugasClient() {
  const [tugas, setTugas] = useState<MasterTugas[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    id_tugas: '',
    nama_tugas: '',
    bonus_per_unit: 0,
    aktif: true,
  })
  const supabase = createClient()

  useEffect(() => {
    loadTugas()
  }, [])

  const loadTugas = async () => {
    try {
      const { data, error } = await supabase
        .from('master_tugas')
        .select('*')
        .order('id_tugas', { ascending: true })

      if (error) throw error
      setTugas(data || [])
    } catch (error: any) {
      console.error('Error loading tugas:', error)
      alert('Gagal memuat data tugas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('master_tugas')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('master_tugas')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])

        if (error) throw error
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({
        id_tugas: '',
        nama_tugas: '',
        bonus_per_unit: 0,
        aktif: true,
      })
      loadTugas()
    } catch (error: any) {
      console.error('Error saving tugas:', error)
      alert('Gagal menyimpan data tugas')
    }
  }

  const handleEdit = (item: MasterTugas) => {
    setEditingId(item.id)
    setFormData({
      id_tugas: item.id_tugas,
      nama_tugas: item.nama_tugas,
      bonus_per_unit: item.bonus_per_unit,
      aktif: item.aktif,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return

    try {
      const { error } = await supabase
        .from('master_tugas')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadTugas()
    } catch (error: any) {
      console.error('Error deleting tugas:', error)
      alert('Gagal menghapus data tugas')
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Tugas</h1>
          <p className="text-gray-600 mt-2">Daftar jenis pekerjaan + nilai bonus</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingId(null)
          setFormData({
            id_tugas: '',
            nama_tugas: '',
            bonus_per_unit: 0,
            aktif: true,
          })
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tugas
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Tugas
                </label>
                <input
                  type="text"
                  value={formData.id_tugas}
                  onChange={(e) => setFormData({ ...formData, id_tugas: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="T001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tugas
                </label>
                <input
                  type="text"
                  value={formData.nama_tugas}
                  onChange={(e) => setFormData({ ...formData, nama_tugas: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus per Unit
                </label>
                <input
                  type="number"
                  value={formData.bonus_per_unit}
                  onChange={(e) => setFormData({ ...formData, bonus_per_unit: Number(e.target.value) })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.aktif ? 'YA' : 'TIDAK'}
                  onChange={(e) => setFormData({ ...formData, aktif: e.target.value === 'YA' })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="YA">YA</option>
                  <option value="TIDAK">TIDAK</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Simpan</Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowForm(false)
                setEditingId(null)
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID Tugas</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Tugas</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bonus per Unit</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aktif</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tugas.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{item.id_tugas}</td>
                  <td className="py-3 px-4 text-sm font-medium">{item.nama_tugas}</td>
                  <td className="py-3 px-4 text-sm">{formatCurrency(item.bonus_per_unit)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.aktif ? 'YA' : 'TIDAK'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

