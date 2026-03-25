import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/consent', '/api/auth/callback', '/api/auth/register']
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

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check demo mode cookie first
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  if (isDemoMode) {
    const demoCookie = request.cookies.get('demo-auth-session')
    if (isProtectedRoute(pathname) && !demoCookie?.value) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Production: Supabase auth
  const { user, supabaseResponse } = await updateSession(request)

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
