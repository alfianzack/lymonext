'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { TransaksiPenjualan, MasterProduk, DatabaseKlien } from '@/lib/types/database'

export default function TransaksiPenjualanClient() {
  const [transaksi, setTransaksi] = useState<TransaksiPenjualan[]>([])
  const [produk, setProduk] = useState<MasterProduk[]>([])
  const [klien, setKlien] = useState<DatabaseKlien[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    no_invoice: '',
    id_klien: '',
    id_produk: '',
    qty: 1,
    diskon: 0,
  })
  const [selectedProduk, setSelectedProduk] = useState<MasterProduk | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.id_produk) {
      const produkData = produk.find(p => p.id_produk === formData.id_produk)
      setSelectedProduk(produkData || null)
    } else {
      setSelectedProduk(null)
    }
  }, [formData.id_produk, produk])

  const loadData = async () => {
    try {
      const [transaksiRes, produkRes, klienRes] = await Promise.all([
        supabase.from('transaksi_penjualan').select('*').order('tanggal', { ascending: false }),
        supabase.from('master_produk').select('*').eq('aktif', true).order('id_produk'),
        supabase.from('database_klien').select('*').order('id_klien'),
      ])

      if (transaksiRes.error) throw transaksiRes.error
      if (produkRes.error) throw produkRes.error
      if (klienRes.error) throw klienRes.error

      setTransaksi(transaksiRes.data || [])
      setProduk(produkRes.data || [])
      setKlien(klienRes.data || [])
    } catch (error: any) {
      console.error('Error loading data:', error)
      alert('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!selectedProduk) return 0
    const subtotal = selectedProduk.harga_jual * formData.qty
    return subtotal - (formData.diskon || 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduk) {
      alert('Pilih produk terlebih dahulu')
      return
    }

    try {
      const totalTagihan = calculateTotal()
      const dataToSave = {
        tanggal: formData.tanggal,
        no_invoice: formData.no_invoice,
        id_klien: formData.id_klien,
        id_produk: formData.id_produk,
        nama_produk: selectedProduk.nama_produk,
        jenis_item: selectedProduk.kategori,
        qty: formData.qty,
        harga_satuan: selectedProduk.harga_jual,
        diskon: formData.diskon || 0,
        total_tagihan: totalTagihan,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from('transaksi_penjualan')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('transaksi_penjualan')
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
        no_invoice: '',
        id_klien: '',
        id_produk: '',
        qty: 1,
        diskon: 0,
      })
      setSelectedProduk(null)
      loadData()
    } catch (error: any) {
      console.error('Error saving transaksi:', error)
      alert('Gagal menyimpan transaksi')
    }
  }

  const handleEdit = (item: TransaksiPenjualan) => {
    setEditingId(item.id)
    setFormData({
      tanggal: item.tanggal.split('T')[0],
      no_invoice: item.no_invoice,
      id_klien: item.id_klien,
      id_produk: item.id_produk,
      qty: item.qty,
      diskon: item.diskon || 0,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return

    try {
      const { error } = await supabase
        .from('transaksi_penjualan')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error: any) {
      console.error('Error deleting transaksi:', error)
      alert('Gagal menghapus transaksi')
    }
  }

  if (loading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Input Transaksi Klien</h1>
          <p className="text-gray-600 mt-2">Catat transaksi penjualan ke klien</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingId(null)
          setFormData({
            tanggal: new Date().toISOString().split('T')[0],
            no_invoice: '',
            id_klien: '',
            id_produk: '',
            qty: 1,
            diskon: 0,
          })
          setSelectedProduk(null)
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
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
                  No Invoice
                </label>
                <input
                  type="text"
                  value={formData.no_invoice}
                  onChange={(e) => setFormData({ ...formData, no_invoice: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="INV-2025-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klien
                </label>
                <select
                  value={formData.id_klien}
                  onChange={(e) => setFormData({ ...formData, id_klien: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Pilih Klien</option>
                  {klien.map((k) => (
                    <option key={k.id} value={k.id_klien}>
                      {k.id_klien} - {k.nama_klien}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk
                </label>
                <select
                  value={formData.id_produk}
                  onChange={(e) => setFormData({ ...formData, id_produk: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Pilih Produk</option>
                  {produk.map((p) => (
                    <option key={p.id} value={p.id_produk}>
                      {p.id_produk} - {p.nama_produk} ({formatCurrency(p.harga_jual)})
                    </option>
                  ))}
                </select>
              </div>
              {selectedProduk && (
                <>
                  <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Nama Produk: <span className="font-semibold">{selectedProduk.nama_produk}</span></p>
                    <p className="text-sm text-gray-600">Jenis Item: <span className="font-semibold">{selectedProduk.kategori}</span></p>
                    <p className="text-sm text-gray-600">Harga Satuan: <span className="font-semibold">{formatCurrency(selectedProduk.harga_jual)}</span></p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      value={formData.qty}
                      onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diskon
                    </label>
                    <input
                      type="number"
                      value={formData.diskon}
                      onChange={(e) => setFormData({ ...formData, diskon: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="col-span-2 p-4 bg-primary-50 rounded-lg">
                    <p className="text-lg font-semibold text-primary-900">
                      Total Tagihan: {formatCurrency(calculateTotal())}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!selectedProduk}>Simpan</Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setSelectedProduk(null)
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No Invoice</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Klien</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produk</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jenis</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Tagihan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{formatDate(item.tanggal)}</td>
                  <td className="py-3 px-4 text-sm font-medium">{item.no_invoice}</td>
                  <td className="py-3 px-4 text-sm">{item.id_klien}</td>
                  <td className="py-3 px-4 text-sm">{item.nama_produk}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.jenis_item === 'Paket' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {item.jenis_item}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{item.qty}</td>
                  <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(item.total_tagihan)}</td>
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

