import { NextRequest, NextResponse } from 'next/server'
import { updateMasterProduk, deleteMasterProduk } from '@/lib/db/data-fetcher'

// PUT - Update master produk
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = await updateMasterProduk(params.id, body)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error updating master_produk:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Hapus master produk
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteMasterProduk(params.id)

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus',
    })
  } catch (error: any) {
    console.error('Error deleting master_produk:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

