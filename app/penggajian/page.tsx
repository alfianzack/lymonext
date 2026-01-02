import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import PenggajianClient from './PenggajianClient'

export default async function PenggajianPage() {
  const { user, redirect: redirectTo } = await requireAuth('owner')
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <PenggajianClient />
    </AppLayout>
  )
}

