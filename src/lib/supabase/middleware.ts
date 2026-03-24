import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DEMO_COOKIE_NAME, findDemoAccountById } from '@/lib/demo/demo-accounts'

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function updateSession(request: NextRequest) {
  // ─── Demo mode: read auth from demo cookie ───────────────────────────
  if (isDemoMode) {
    return updateDemoSession(request)
  }

  // ─── Production mode: Supabase auth ──────────────────────────────────
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and supabase.auth.getUser().
  // A simple mistake could make it very hard to debug issues with users being
  // randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user, supabaseResponse }
}

function updateDemoSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })
  const cookie = request.cookies.get(DEMO_COOKIE_NAME)

  if (!cookie?.value) {
    return { user: null, supabaseResponse }
  }

  try {
    const session = JSON.parse(cookie.value)
    const account = findDemoAccountById(session.id)

    if (!account) {
      return { user: null, supabaseResponse }
    }

    // Return a user-like object compatible with the middleware checks
    const user = {
      id: account.id,
      email: account.email,
      phone: account.phone,
      user_metadata: {
        full_name: account.fullName,
        role: account.role,
      },
    }

    return { user, supabaseResponse }
  } catch {
    return { user: null, supabaseResponse }
  }
}
