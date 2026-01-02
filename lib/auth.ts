import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { UserRole } from '@/lib/types/database'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    return {
      id: payload.id as string,
      email: payload.email as string,
      role: (payload.role as UserRole) || 'admin',
    }
  } catch (error) {
    return null
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

