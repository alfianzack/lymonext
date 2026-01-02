import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import MasterProdukClient from './MasterProdukClient'

export default async function MasterProdukPage() {
  const { user, redirect: redirectTo } = await requireAuth('owner')
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <MasterProdukClient />
    </AppLayout>
  )
}

