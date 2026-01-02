import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import DatabaseKlienClient from './DatabaseKlienClient'

export default async function DatabaseKlienPage() {
  const { user, redirect: redirectTo } = await requireAuth()
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <DatabaseKlienClient />
    </AppLayout>
  )
}

