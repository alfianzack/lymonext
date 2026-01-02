'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { FixCost } from '@/lib/types/database'

export default function FixCostClient() {
  const [fixCosts, setFixCosts] = useState<FixCost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nama_biaya: '',
    jumlah: 0,
    aktif: true,
  })
  const supabase = createClient()

  useEffect(() => {
    loadFixCosts()
  }, [])

  const loadFixCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('fix_cost')
        .select('*')
        .order('nama_biaya', { ascending: true })

      if (error) throw error
      setFixCosts(data || [])
    } catch (error: any) {
      console.error('Error loading fix cost:', error)
      alert('Gagal memuat data fix cost')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('fix_cost')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('fix_cost')
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
        nama_biaya: '',
        jumlah: 0,
        aktif: true,
      })
      loadFixCosts()
    } catch (error: any) {
      console.error('Error saving fix cost:', error)
      alert('Gagal menyimpan fix cost')
    }
  }

  const handleEdit = (item: FixCost) => {
    setEditingId(item.id)
    setFormData({
      nama_biaya: item.nama_biaya,
      jumlah: item.jumlah,
      aktif: item.aktif,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus fix cost ini?')) return

    try {
      const { error } = await supabase
        .from('fix_cost')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadFixCosts()
    } catch (error: any) {
      console.error('Error deleting fix cost:', error)
      alert('Gagal menghapus fix cost')
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fix Cost</h1>
          <p className="text-gray-600 mt-2">Biaya tetap bulanan</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingId(null)
          setFormData({
            nama_biaya: '',
            jumlah: 0,
            aktif: true,
          })
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Fix Cost
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Fix Cost' : 'Tambah Fix Cost Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Biaya
                </label>
                <input
                  type="text"
                  value={formData.nama_biaya}
                  onChange={(e) => setFormData({ ...formData, nama_biaya: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Sewa, Internet, Software"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah (per bulan)
                </label>
                <input
                  type="number"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Biaya</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jumlah (per bulan)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aktif</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fixCosts.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium">{item.nama_biaya}</td>
                  <td className="py-3 px-4 text-sm">{formatCurrency(item.jumlah)}</td>
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

