/**
 * Contoh penggunaan Master Produk dengan API routes
 * API routes akan otomatis switch antara Supabase REST API dan PostgreSQL local
 * berdasarkan DATABASE_MODE environment variable
 */

'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { MasterProduk } from '@/lib/types/database'
import {
  getMasterProduk,
  createMasterProduk,
  updateMasterProduk,
  deleteMasterProduk,
} from '@/lib/api/master-produk-client'

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

  useEffect(() => {
    loadProduk()
  }, [])

  const loadProduk = async () => {
    try {
      // Menggunakan API client yang otomatis switch berdasarkan DATABASE_MODE
      const data = await getMasterProduk({
        order: 'id_produk',
        dir: 'asc',
      })
      setProduk(data)
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
        await updateMasterProduk(editingId, formData)
      } else {
        await createMasterProduk(formData)
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
      await deleteMasterProduk(id)
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
        <h1 className="text-2xl font-bold">Master Produk</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Produk' : 'Tambah Produk'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields... */}
            <div className="flex gap-2">
              <Button type="submit">Simpan</Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">ID Produk</th>
                <th className="text-left p-2">Nama Produk</th>
                <th className="text-left p-2">Kategori</th>
                <th className="text-right p-2">Harga</th>
                <th className="text-left p-2">Satuan</th>
                <th className="text-center p-2">Aktif</th>
                <th className="text-center p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produk.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.id_produk}</td>
                  <td className="p-2">{item.nama_produk}</td>
                  <td className="p-2">{item.kategori}</td>
                  <td className="p-2 text-right">{formatCurrency(item.harga_jual)}</td>
                  <td className="p-2">{item.satuan}</td>
                  <td className="p-2 text-center">
                    {item.aktif ? '✓' : '✗'}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2 justify-center">
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

