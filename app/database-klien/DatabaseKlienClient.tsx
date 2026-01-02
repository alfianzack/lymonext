'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { DatabaseKlien } from '@/lib/types/database'

export default function DatabaseKlienClient() {
  const [klien, setKlien] = useState<DatabaseKlien[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    id_klien: '',
    nama_klien: '',
    email: '',
    telepon: '',
    alamat: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadKlien()
  }, [])

  const loadKlien = async () => {
    try {
      const { data, error } = await supabase
        .from('database_klien')
        .select('*')
        .order('id_klien', { ascending: true })

      if (error) throw error
      setKlien(data || [])
    } catch (error: any) {
      console.error('Error loading klien:', error)
      alert('Gagal memuat data klien')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('database_klien')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('database_klien')
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
        id_klien: '',
        nama_klien: '',
        email: '',
        telepon: '',
        alamat: '',
      })
      loadKlien()
    } catch (error: any) {
      console.error('Error saving klien:', error)
      alert('Gagal menyimpan data klien')
    }
  }

  const handleEdit = (item: DatabaseKlien) => {
    setEditingId(item.id)
    setFormData({
      id_klien: item.id_klien,
      nama_klien: item.nama_klien,
      email: item.email || '',
      telepon: item.telepon || '',
      alamat: item.alamat || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus klien ini?')) return

    try {
      const { error } = await supabase
        .from('database_klien')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadKlien()
    } catch (error: any) {
      console.error('Error deleting klien:', error)
      alert('Gagal menghapus data klien')
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Klien</h1>
          <p className="text-gray-600 mt-2">Master data klien</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingId(null)
          setFormData({
            id_klien: '',
            nama_klien: '',
            email: '',
            telepon: '',
            alamat: '',
          })
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Klien
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Klien' : 'Tambah Klien Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Klien
                </label>
                <input
                  type="text"
                  value={formData.id_klien}
                  onChange={(e) => setFormData({ ...formData, id_klien: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="K001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Klien
                </label>
                <input
                  type="text"
                  value={formData.nama_klien}
                  onChange={(e) => setFormData({ ...formData, nama_klien: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon
                </label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID Klien</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama Klien</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Telepon</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Alamat</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {klien.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{item.id_klien}</td>
                  <td className="py-3 px-4 text-sm font-medium">{item.nama_klien}</td>
                  <td className="py-3 px-4 text-sm">{item.email || '-'}</td>
                  <td className="py-3 px-4 text-sm">{item.telepon || '-'}</td>
                  <td className="py-3 px-4 text-sm">{item.alamat || '-'}</td>
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

