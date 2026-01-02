'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  ClipboardList,
  Briefcase,
  DollarSign,
  FileText,
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole: 'admin' | 'owner'
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['owner'] as const,
    },
    {
      title: 'Master Produk',
      href: '/master-produk',
      icon: Package,
      roles: ['owner'] as const,
    },
    {
      title: 'Transaksi Penjualan',
      href: '/transaksi-penjualan',
      icon: ShoppingCart,
      roles: ['admin', 'owner'] as const,
    },
    {
      title: 'Database Klien',
      href: '/database-klien',
      icon: Users,
      roles: ['admin', 'owner'] as const,
    },
    {
      title: 'Log Tugas',
      href: '/log-tugas',
      icon: ClipboardList,
      roles: ['admin', 'owner'] as const,
    },
    {
      title: 'Master Tugas',
      href: '/master-tugas',
      icon: Briefcase,
      roles: ['owner'] as const,
    },
    {
      title: 'Penggajian',
      href: '/penggajian',
      icon: DollarSign,
      roles: ['owner'] as const,
    },
    {
      title: 'Biaya Operasional',
      href: '/biaya-operasional',
      icon: FileText,
      roles: ['admin', 'owner'] as const,
    },
    {
      title: 'Fix Cost',
      href: '/fix-cost',
      icon: Settings,
      roles: ['owner'] as const,
    },
    {
      title: 'Profit per Invoice',
      href: '/profit-invoice',
      icon: TrendingUp,
      roles: ['owner'] as const,
    },
    {
      title: 'Laporan Laba Rugi',
      href: '/laporan-laba-rugi',
      icon: TrendingUp,
      roles: ['owner'] as const,
    },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Lymo Studio</h1>
        <p className="text-sm text-gray-400 mt-1">Aplikasi Keuangan</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

