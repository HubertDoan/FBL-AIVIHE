import { createBrowserClient } from '@supabase/ssr'

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function createClient() {
  if (isDemoMode) {
    // In demo mode, return a minimal mock that won't throw on missing env vars.
    // Auth is handled entirely through the demo API routes and DemoAuthProvider.
    // Any Supabase-specific calls will be no-ops or return empty results.
    return createMockSupabaseClient()
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Minimal mock that satisfies the SupabaseClient interface for demo mode
function createMockSupabaseClient() {
  const noopQuery = () => ({
    select: noopQuery,
    insert: noopQuery,
    update: noopQuery,
    delete: noopQuery,
    eq: noopQuery,
    single: noopQuery,
    order: noopQuery,
    limit: noopQuery,
    range: noopQuery,
    then: (resolve: (v: { data: null; error: null }) => void) =>
      resolve({ data: null, error: null }),
    data: null,
    error: null,
  })

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithOtp: async () => ({
        data: null,
        error: { message: 'Demo mode: use demo login' },
      }),
      verifyOtp: async () => ({
        data: null,
        error: { message: 'Demo mode: use demo login' },
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => noopQuery(),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    rpc: async () => ({ data: null, error: null }),
  } as unknown as ReturnType<typeof createBrowserClient>
}
