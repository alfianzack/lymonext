import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/types/database'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user role from user metadata or separate table
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    role: (userData?.role as UserRole) || 'admin',
  }
}

export async function requireAuth(requiredRole?: UserRole) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { user: null, redirect: '/login' }
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'owner') {
    return { user: null, redirect: '/unauthorized' }
  }

  return { user, redirect: null }
}

