// Helper utilities for demo mode API routes
// Reads demo session from cookie and provides standard response helpers

import { NextResponse } from 'next/server'
import {
  isDemoMode as checkDemoMode,
  DEMO_COOKIE_NAME,
  findDemoAccountById,
} from './demo-accounts'
import type { DemoAccount } from './demo-accounts'

export { type DemoAccount }

/**
 * Check if demo mode is enabled via env var
 */
export function isDemoMode(): boolean {
  return checkDemoMode()
}

/**
 * Extract the current demo user from the request cookie.
 * Returns null if no valid demo session exists.
 */
export async function getDemoUser(
  request: Request
): Promise<DemoAccount | null> {
  try {
    // Parse cookies from the request header
    const cookieHeader = request.headers.get('cookie') ?? ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...rest] = c.trim().split('=')
        return [key, rest.join('=')]
      })
    )

    const raw = cookies[DEMO_COOKIE_NAME]
    if (!raw) return null

    const session = JSON.parse(decodeURIComponent(raw))
    if (!session?.id) return null

    const account = findDemoAccountById(session.id)
    return account ?? null
  } catch {
    return null
  }
}

/**
 * Create a standard JSON response for demo data
 */
export function demoResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Return 401 for unauthenticated demo requests
 */
export function demoUnauthorized(): NextResponse {
  return NextResponse.json(
    { error: 'Bạn chưa đăng nhập (demo).' },
    { status: 401 }
  )
}

/**
 * Return 403 for non-admin demo requests
 */
export function demoForbidden(): NextResponse {
  return NextResponse.json(
    { error: 'Bạn không có quyền truy cập (demo).' },
    { status: 403 }
  )
}

/**
 * Roles that have admin-level access to the admin panel
 */
export const ADMIN_ROLES = ['admin', 'director', 'branch_director', 'super_admin'] as const

/**
 * Check if a role has admin-level access
 */
export function hasAdminAccess(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role)
}
