import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import LogTugasClient from './LogTugasClient'

export default async function LogTugasPage() {
  const { user, redirect: redirectTo } = await requireAuth()
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <LogTugasClient userRole={user?.role || 'admin'} />
    </AppLayout>
  )
}

