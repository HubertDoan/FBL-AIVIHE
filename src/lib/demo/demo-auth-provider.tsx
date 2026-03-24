'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { DemoAccount } from './demo-accounts'

interface DemoAuthState {
  currentUser: DemoAccount | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface DemoAuthContextValue extends DemoAuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  getCurrentUser: () => DemoAccount | null
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null)

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoAuthState>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Load session from cookie on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/demo/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setState({
              currentUser: data.user,
              isAuthenticated: true,
              isLoading: false,
            })
            return
          }
        }
      } catch {
        // ignore fetch errors
      }
      setState({ currentUser: null, isAuthenticated: false, isLoading: false })
    }
    loadSession()
  }, [])

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error?: string }> => {
      try {
        const res = await fetch('/api/demo/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          return { error: data.error || 'Đăng nhập thất bại' }
        }

        setState({
          currentUser: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
        return {}
      } catch {
        return { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' }
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/demo/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    setState({ currentUser: null, isAuthenticated: false, isLoading: false })
  }, [])

  const getCurrentUser = useCallback(() => {
    return state.currentUser
  }, [state.currentUser])

  return (
    <DemoAuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        getCurrentUser,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  )
}

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext)
  if (!ctx) {
    throw new Error('useDemoAuth must be used within DemoAuthProvider')
  }
  return ctx
}
