import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import TransaksiPenjualanClient from './TransaksiPenjualanClient'

export default async function TransaksiPenjualanPage() {
  const { user, redirect: redirectTo } = await requireAuth()
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <TransaksiPenjualanClient />
    </AppLayout>
  )
}

