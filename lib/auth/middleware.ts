import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function updateSession(request: NextRequest) {
  // Skip auth untuk login dan API routes
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value

  // Jika tidak ada token dan bukan di halaman login, redirect ke login
  if (!token) {
    if (request.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Verify token
  try {
    await jwtVerify(token, JWT_SECRET)
    // Jika sudah login dan mengakses halaman login, redirect ke dashboard
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  } catch (error) {
    // Token invalid, hapus cookie dan redirect ke login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

