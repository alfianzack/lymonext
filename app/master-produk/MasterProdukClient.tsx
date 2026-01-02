'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { MasterProduk } from '@/lib/types/database'

export default function MasterProdukClient() {
  const [produk, setProduk] = useState<MasterProduk[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    id_produk: '',
    nama_produk: '',
    kategori: 'Paket' as 'Paket' | 'Tambahan',
    harga_jual: 0,
    satuan: 'Paket' as 'Paket' | 'Orang' | 'File' | 'Cetak',
    aktif: true,
  })
  const supabase = createClient()

  useEffect(() => {
    loadProduk()
  }, [])

  const loadProduk = async () => {
    try {
      const { data, error } = await supabase
        .from('master_produk')
        .select('*')
        .order('id_produk', { ascending: true })

      if (error) throw error
      setProduk(data || [])
    } catch (error: any) {
      console.error('Error loading produk:', error)
      alert('Gagal memuat data produk')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('master_produk')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('master_produk')
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
        id_produk: '',
        nama_produk: '',
        kategori: 'Paket',
        harga_jual: 0,
        satuan: 'Paket',
        aktif: true,
      })
      loadProduk()
    } catch (error: any) {
      console.error('Error saving produk:', error)
      alert('Gagal menyimpan data produk')
    }
  }

  const handleEdit = (item: MasterProduk) => {
    setEditingId(item.id)
    setFormData({
      id_produk: item.id_produk,
      nama_produk: item.nama_produk,
      kategori: item.kategori,
      harga_jual: item.harga_jual,
      satuan: item.satuan,
      aktif: item.aktif,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return

    try {
      const { error } = await supabase
        .from('master_produk')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadProduk()
    } catch (error: any) {
      console.error('Error deleting produk:', error)
      alert('Gagal menghapus data produk')
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Produk & Layanan</h1>
          <p className="text-gray-600 mt-2">Daftar seluruh paket & tambahan yang bisa dijual ke klien</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingId(null)
          setFormData({
            id_produk: '',
            nama_produk: '',
            kategori: 'Paket',
            harga_jual: 0,
            satuan: 'Paket',
            aktif: true,
          })
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Produk
                </label>
                <input
                  type="text"
                  value={formData.id_produk}
                  onChange={(e) => setFormData({ ...formData, id_produk: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="P001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={formData.nama_produk}
                  onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value as 'Paket' | 'Tambahan' })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Paket">Paket</option>
                  <option value="Tambahan">Tambahan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Jual
                </label>
                <input
                  type="number"
                  value={formData.harga_jual}
                  onChange={(e) => setFormData({ ...formData, harga_jual: Number(e.target.value) })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satuan
                </label>
                <select
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value as 'Paket' | 'Orang' | 'File' | 'Cetak' })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Paket">Paket</option>
                  <option value="Orang">Orang</option>
                  <option value="File">File</option>
                  <option value="Cetak">Cetak</option>
                </select>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID Produk</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Produk</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Harga Jual</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Satuan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aktif</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produk.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{item.id_produk}</td>
                  <td className="py-3 px-4 text-sm font-medium">{item.nama_produk}</td>
                  <td className="py-3 px-4 text-sm">{item.kategori}</td>
                  <td className="py-3 px-4 text-sm">{formatCurrency(item.harga_jual)}</td>
                  <td className="py-3 px-4 text-sm">{item.satuan}</td>
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

