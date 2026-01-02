import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import BiayaOperasionalClient from './BiayaOperasionalClient'

export default async function BiayaOperasionalPage() {
  const { user, redirect: redirectTo } = await requireAuth()
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <BiayaOperasionalClient />
    </AppLayout>
  )
}

