import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import LaporanLabaRugiClient from './LaporanLabaRugiClient'

export default async function LaporanLabaRugiPage() {
  const { user, redirect: redirectTo } = await requireAuth('owner')
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <LaporanLabaRugiClient />
    </AppLayout>
  )
}

