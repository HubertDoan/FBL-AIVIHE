import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/', '/login', '/consent', '/api/auth/callback']
const DEMO_API_ROUTES = ['/api/demo/login', '/api/demo/logout', '/api/demo/me']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isDemoApiRoute(pathname: string): boolean {
  return DEMO_API_ROUTES.some((route) => pathname === route)
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow demo API routes through
  if (isDemoApiRoute(pathname)) {
    return NextResponse.next()
  }

  const { user, supabaseResponse } = await updateSession(request)

  // Allow public routes and static assets
  if (isPublicRoute(pathname)) {
    return supabaseResponse
  }

  // Protect dashboard and admin routes
  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
