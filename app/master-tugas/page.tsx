import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import MasterTugasClient from './MasterTugasClient'

export default async function MasterTugasPage() {
  const { user, redirect: redirectTo } = await requireAuth('owner')
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <MasterTugasClient />
    </AppLayout>
  )
}

