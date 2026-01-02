import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <p className="text-xl text-gray-600 mb-8">Akses Ditolak</p>
        <p className="text-gray-500 mb-8">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <Link href="/dashboard">
          <Button>Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

