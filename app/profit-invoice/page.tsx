import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'
import ProfitInvoiceClient from './ProfitInvoiceClient'

export default async function ProfitInvoicePage() {
  const { user, redirect: redirectTo } = await requireAuth('owner')
  
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AppLayout>
      <ProfitInvoiceClient />
    </AppLayout>
  )
}

