'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { BiayaOperasional } from '@/lib/types/database'

export default function BiayaOperasionalClient() {
  const [biaya, setBiaya] = useState<BiayaOperasional[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi: '',
    jumlah: 0,
    ref_invoice: '',
    kategori: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadBiaya()
  }, [])

  const loadBiaya = async () => {
    try {
      const { data, error } = await supabase
        .from('biaya_operasional')
        .select('*')
        .order('tanggal', { ascending: false })

      if (error) throw error
      setBiaya(data || [])
    } catch (error: any) {
      console.error('Error loading biaya:', error)
      alert('Gagal memuat data biaya operasional')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('biaya_operasional')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('biaya_operasional')
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
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: '',
        jumlah: 0,
        ref_invoice: '',
        kategori: '',
      })
      loadBiaya()
    } catch (error: any) {
      console.error('Error saving biaya:', error)
      alert('Gagal menyimpan biaya operasional')
    }
  }

  const handleEdit = (item: BiayaOperasional) => {
    setEditingId(item.id)
    setFormData({
      tanggal: item.tanggal.split('T')[0],
      deskripsi: item.deskripsi,
      jumlah: item.jumlah,
      ref_invoice: item.ref_invoice || '',
      kategori: item.kategori,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus biaya ini?')) return

    try {
      const { error } = await supabase
        .from('biaya_operasional')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadBiaya()
    } catch (error: any) {
      console.error('Error deleting biaya:', error)
      alert('Gagal menghapus biaya operasional')
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biaya Operasional</h1>
          <p className="text-gray-600 mt-2">Untuk biaya variabel & vendor</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingId(null)
          setFormData({
            tanggal: new Date().toISOString().split('T')[0],
            deskripsi: '',
            jumlah: 0,
            ref_invoice: '',
            kategori: '',
          })
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Biaya
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Biaya Operasional' : 'Tambah Biaya Operasional Baru'}
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
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Freelance, Cetak, dll"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah
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
                  Ref Invoice (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.ref_invoice}
                  onChange={(e) => setFormData({ ...formData, ref_invoice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="INV-2025-001"
                />
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Deskripsi</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ref Invoice</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jumlah</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {biaya.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{formatDate(item.tanggal)}</td>
                  <td className="py-3 px-4 text-sm">{item.kategori}</td>
                  <td className="py-3 px-4 text-sm">{item.deskripsi}</td>
                  <td className="py-3 px-4 text-sm">{item.ref_invoice || '-'}</td>
                  <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(item.jumlah)}</td>
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

