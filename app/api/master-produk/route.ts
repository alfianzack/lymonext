import { NextRequest, NextResponse } from 'next/server'
import { 
  fetchMasterProduk, 
  insertMasterProduk, 
  updateMasterProduk, 
  deleteMasterProduk 
} from '@/lib/db/data-fetcher'

// GET - Ambil semua master produk
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const order = searchParams.get('order') || 'id_produk'
    const dir = (searchParams.get('dir') || 'asc') as 'asc' | 'desc'
    const aktifParam = searchParams.get('aktif')
    const aktif = aktifParam ? aktifParam === 'true' : undefined

    const data = await fetchMasterProduk({
      order,
      dir,
      aktif,
    })

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error fetching master_produk:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Tambah master produk baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await insertMasterProduk(body)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error creating master_produk:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

