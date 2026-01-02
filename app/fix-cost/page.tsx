import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import FixCostClient from './FixCostClient'

export default async function FixCostPage() {
  const { user, redirect: redirectTo } = await requireAuth('owner')
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <FixCostClient />
    </AppLayout>
  )
}

